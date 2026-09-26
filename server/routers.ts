import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import * as db from "./db";

const productItem = z.object({ productId: z.number().int().positive(), productName: z.string().min(1).max(255), productImage: z.string().url().optional(), unitPrice: z.number().int().nonnegative(), quantity: z.number().int().positive() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(320), password: z.string().min(6).max(128) })).mutation(async ({ ctx, input }) => {
      try {
        const user = await db.createEmailUser(input);
        if (!user) throw new Error("Kullanıcı oluşturulamadı.");
        const token = await sdk.createSessionToken(user.openId, { name: user.name || input.name });
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 365 });
        return { success: true } as const;
      } catch (error) {
        if (error instanceof Error && error.message.includes("zaten kayıtlı")) throw new TRPCError({ code: "CONFLICT", message: error.message });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Kayıt sırasında bir hata oluştu." });
      }
    }),
    login: publicProcedure.input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      const user = await db.getUserByEmail(input.email.trim().toLowerCase());
      if (!user?.passwordHash || !db.verifyPassword(input.password, user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "E-posta veya şifre hatalı." });
      const token = await sdk.createSessionToken(user.openId, { name: user.name || user.email || "Miraju üyesi" });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 365 });
      return { success: true } as const;
    }),
    requestPasswordReset: publicProcedure.input(z.object({ email: z.string().email().max(320) })).mutation(async ({ input }) => {
      const token = await db.createPasswordResetRequest(input.email);
      return { success: true, resetToken: process.env.NODE_ENV === "production" ? undefined : token } as const;
    }),
    resetPassword: publicProcedure.input(z.object({ token: z.string().min(20).max(128), password: z.string().min(6).max(128) })).mutation(async ({ input }) => {
      const success = await db.resetPassword(input.token, input.password);
      if (!success) throw new TRPCError({ code: "BAD_REQUEST", message: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş." });
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  storefront: router({
    favorites: protectedProcedure.query(({ ctx }) => db.getFavoriteProductIds(ctx.user.openId)),
    setFavorite: protectedProcedure.input(z.object({ productId: z.number().int().positive(), favorite: z.boolean() })).mutation(({ ctx, input }) => db.setFavorite(ctx.user.openId, input.productId, input.favorite)),
    orders: protectedProcedure.query(({ ctx }) => db.getOrders(ctx.user.openId)),
    createOrder: protectedProcedure.input(z.object({ total: z.number().int().nonnegative(), itemCount: z.number().int().positive(), invoiceType: z.enum(["individual", "corporate", "einvoice"]), shippingAddress: z.string().max(2000).optional(), items: z.array(productItem).min(1) })).mutation(({ ctx, input }) => db.createOrder(ctx.user.openId, input)),
    reviews: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => db.getProductReviews(input.productId)),
    createReview: protectedProcedure.input(z.object({ productId: z.number().int().positive(), rating: z.number().int().min(1).max(5), text: z.string().trim().min(3).max(2000) })).mutation(({ ctx, input }) => db.createReview(ctx.user.openId, input)),
  }),
  admin: router({
    users: adminProcedure.query(() => db.getAdminUsers()),
    updateUserRole: adminProcedure.input(z.object({ id: z.number().int().positive(), role: z.enum(["user", "admin"]) })).mutation(({ input }) => db.updateUserRole(input.id, input.role)),
    orders: adminProcedure.query(() => db.getAdminOrders()),
    reviews: adminProcedure.query(() => db.getAdminReviews()),
    updateOrderStatus: adminProcedure.input(z.object({ publicId: z.string().min(1).max(32), status: z.enum(["Hazırlanıyor", "Tamamlandı", "İptal edildi"]) })).mutation(({ input }) => db.updateOrderStatus(input.publicId, input.status)),
    updateReviewStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["published", "pending", "rejected"]) })).mutation(({ input }) => db.updateReviewStatus(input.id, input.status)),
    deleteReview: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.deleteReview(input.id)),
  }),
});

export type AppRouter = typeof appRouter;

import { and, desc, eq, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { favorites, InsertUser, orderItems, orders, reviews, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function requireUserId(openId: string) {
  const user = await getUserByOpenId(openId);
  if (!user) throw new Error("User record not found");
  return user.id;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export async function getUserByEmail(email: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createEmailUser(input: { name: string; email: string; password: string }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Bu e-posta adresi zaten kayıtlı.");
  const openId = `email:${email}`;
  await db.insert(users).values({ openId, name: input.name.trim(), email, passwordHash: hashPassword(input.password), loginMethod: "email" });
  return getUserByOpenId(openId);
}

export async function createPasswordResetRequest(email: string) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const user = await getUserByEmail(email.trim().toLowerCase());
  if (!user) return null;
  const token = randomBytes(32).toString("hex");
  await db.update(users).set({ passwordResetToken: token, passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000) }).where(eq(users.id, user.id));
  return token;
}

export async function resetPassword(token: string, password: string) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const result = await db.select().from(users).where(and(eq(users.passwordResetToken, token), gt(users.passwordResetExpiresAt, new Date()))).limit(1);
  const user = result[0];
  if (!user) return false;
  await db.update(users).set({ passwordHash: hashPassword(password), passwordResetToken: null, passwordResetExpiresAt: null }).where(eq(users.id, user.id));
  return true;
}

export async function getFavoriteProductIds(openId: string) {
  const db = await getDb(); if (!db) return [];
  const userId = await requireUserId(openId);
  return (await db.select({ productId: favorites.productId }).from(favorites).where(eq(favorites.userId, userId))).map((row) => row.productId);
}

export async function setFavorite(openId: string, productId: number, favorite: boolean) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const userId = await requireUserId(openId);
  if (favorite) await db.insert(favorites).values({ userId, productId }).onDuplicateKeyUpdate({ set: { productId } });
  else await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
  return getFavoriteProductIds(openId);
}

export async function getOrders(openId: string) {
  const db = await getDb(); if (!db) return [];
  const userId = await requireUserId(openId);
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function createOrder(openId: string, input: { total: number; itemCount: number; invoiceType: "individual" | "corporate" | "einvoice"; shippingAddress?: string; items: Array<{ productId: number; productName: string; productImage?: string; unitPrice: number; quantity: number }> }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const userId = await requireUserId(openId);
  const publicId = `MRJ-${Date.now().toString(36).toUpperCase()}`;
  return db.transaction(async (tx) => {
    const result = await tx.insert(orders).values({ publicId, userId, total: input.total, itemCount: input.itemCount, invoiceType: input.invoiceType, shippingAddress: input.shippingAddress ?? null });
    const orderId = Number(result[0].insertId);
    if (input.items.length) await tx.insert(orderItems).values(input.items.map((item) => ({ ...item, orderId, productImage: item.productImage ?? null })));
    return { publicId };
  });
}

export async function getProductReviews(productId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, "published"))).orderBy(desc(reviews.createdAt));
}

export async function createReview(openId: string, input: { productId: number; rating: number; text: string }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const user = await getUserByOpenId(openId); if (!user) throw new Error("User record not found");
  await db.insert(reviews).values({ userId: user.id, productId: input.productId, authorName: user.name || "Miraju müşterisi", rating: input.rating, text: input.text, status: "published" });
  return getProductReviews(input.productId);
}

export async function getAdminOrders() {
  const db = await getDb(); if (!db) return [];
  return db.select({ order: orders, customerName: users.name, customerEmail: users.email })
    .from(orders).leftJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt));
}

export async function getAdminReviews() {
  const db = await getDb(); if (!db) return [];
  return db.select({ review: reviews, customerName: users.name, customerEmail: users.email })
    .from(reviews).leftJoin(users, eq(reviews.userId, users.id)).orderBy(desc(reviews.createdAt));
}

export async function updateOrderStatus(publicId: string, status: "Hazırlanıyor" | "Tamamlandı" | "İptal edildi") {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(orders).set({ status }).where(eq(orders.publicId, publicId));
  return { success: true } as const;
}

export async function updateReviewStatus(id: number, status: "published" | "pending" | "rejected") {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  return { success: true } as const;
}

export async function deleteReview(id: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.delete(reviews).where(eq(reviews.id, id));
  return { success: true } as const;
}

export async function getAdminUsers() {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, loginMethod: users.loginMethod, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ role }).where(eq(users.id, id));
  return { success: true } as const;
}

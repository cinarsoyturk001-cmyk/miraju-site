import { index, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const orderStatus = pgEnum("order_status", ["Hazırlanıyor", "Tamamlandı", "İptal edildi"]);
export const invoiceType = pgEnum("invoice_type", ["individual", "corporate", "einvoice"]);
export const reviewStatus = pgEnum("review_status", ["published", "pending", "rejected"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  passwordResetToken: varchar("passwordResetToken", { length: 128 }),
  passwordResetExpiresAt: timestamp("passwordResetExpiresAt"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  publicId: varchar("publicId", { length: 32 }).notNull().unique(),
  userId: integer("userId").notNull(),
  total: integer("total").notNull(),
  itemCount: integer("itemCount").notNull(),
  status: orderStatus("status").default("Hazırlanıyor").notNull(),
  invoiceType: invoiceType("invoiceType").default("individual").notNull(),
  shippingAddress: text("shippingAddress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({ userCreatedIdx: index("orders_user_created_idx").on(table.userId, table.createdAt) }));

export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productImage: text("productImage"),
  unitPrice: integer("unitPrice").notNull(),
  quantity: integer("quantity").notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ userProductUnique: uniqueIndex("favorites_user_product_unique").on(table.userId, table.productId) }));

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  status: reviewStatus("status").default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({ productStatusIdx: index("reviews_product_status_idx").on(table.productId, table.status) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

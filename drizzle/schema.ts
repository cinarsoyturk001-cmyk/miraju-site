import { int, index, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  passwordResetToken: varchar("passwordResetToken", { length: 128 }),
  passwordResetExpiresAt: timestamp("passwordResetExpiresAt"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("publicId", { length: 32 }).notNull().unique(),
  userId: int("userId").notNull(),
  total: int("total").notNull(),
  itemCount: int("itemCount").notNull(),
  status: mysqlEnum("status", ["Hazırlanıyor", "Tamamlandı", "İptal edildi"]).default("Hazırlanıyor").notNull(),
  invoiceType: mysqlEnum("invoiceType", ["individual", "corporate", "einvoice"]).default("individual").notNull(),
  shippingAddress: text("shippingAddress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ userCreatedIdx: index("orders_user_created_idx").on(table.userId, table.createdAt) }));

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productImage: text("productImage"),
  unitPrice: int("unitPrice").notNull(),
  quantity: int("quantity").notNull(),
});

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ userProductUnique: uniqueIndex("favorites_user_product_unique").on(table.userId, table.productId) }));

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
  text: text("text").notNull(),
  status: mysqlEnum("status", ["published", "pending", "rejected"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ productStatusIdx: index("reviews_product_status_idx").on(table.productId, table.status) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

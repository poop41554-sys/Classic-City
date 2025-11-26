import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - للاعبين
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  discordId: text("discord_id").unique(),
  discordAvatar: text("discord_avatar"),
  discordUsername: text("discord_username"),
  coins: integer("coins").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Login codes - أكواد تسجيل الدخول من اللعبة
export const loginCodes = pgTable("login_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  username: text("username").notNull(),
  used: boolean("used").notNull().default(false),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Products - المنتجات في المتجر
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // vehicles, features, ownership
  price: integer("price").notNull(),
  image: text("image").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  isNew: boolean("is_new").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Purchases - المشتريات
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  price: integer("price").notNull(),
  status: text("status").notNull().default("pending"), // pending, delivered, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLoginCodeSchema = createInsertSchema(loginCodes).omit({
  id: true,
  createdAt: true,
  used: true,
  userId: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LoginCode = typeof loginCodes.$inferSelect;
export type InsertLoginCode = z.infer<typeof insertLoginCodeSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

// Additional schemas for API
export const loginWithCodeSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
});

export const updateCoinsSchema = z.object({
  userId: z.string(),
  amount: z.number().int(),
});

export const purchaseProductSchema = z.object({
  productId: z.string(),
});

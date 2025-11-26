import {
  users,
  loginCodes,
  products,
  purchases,
  type User,
  type InsertUser,
  type LoginCode,
  type InsertLoginCode,
  type Product,
  type InsertProduct,
  type Purchase,
  type InsertPurchase,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {

  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: string, coins: number): Promise<User>;
  getAllUsers(): Promise<User[]>;


  createLoginCode(code: InsertLoginCode): Promise<LoginCode>;
  getLoginCodeByCode(code: string): Promise<LoginCode | undefined>;
  markLoginCodeAsUsed(id: string, userId: string): Promise<void>;


  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: string, stock: number): Promise<Product>;


  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getUserPurchases(userId: string): Promise<any[]>;
  updatePurchaseStatus(id: string, status: string): Promise<void>;
  processPurchaseTransaction(userId: string, productId: string): Promise<{ user: User; purchase: Purchase }>;
}

export class DatabaseStorage implements IStorage {

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCoins(userId: string, coins: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ coins })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }


  async createLoginCode(insertCode: InsertLoginCode): Promise<LoginCode> {
    const [code] = await db.insert(loginCodes).values(insertCode).returning();
    return code;
  }

  async getLoginCodeByCode(code: string): Promise<LoginCode | undefined> {
    const [loginCode] = await db
      .select()
      .from(loginCodes)
      .where(eq(loginCodes.code, code));
    return loginCode || undefined;
  }

  async markLoginCodeAsUsed(id: string, userId: string): Promise<void> {
    await db
      .update(loginCodes)
      .set({ used: true, userId })
      .where(eq(loginCodes.id, id));
  }


  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProductStock(id: string, stock: number): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ stock, inStock: stock > 0 })
      .where(eq(products.id, id))
      .returning();
    return product;
  }


  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases).values(insertPurchase).returning();
    return purchase;
  }

  async getUserPurchases(userId: string): Promise<any[]> {
    const userPurchases = await db
      .select({
        id: purchases.id,
        productId: purchases.productId,
        price: purchases.price,
        status: purchases.status,
        createdAt: purchases.createdAt,
        product: {
          name: products.name,
          image: products.image,
          category: products.category,
        },
      })
      .from(purchases)
      .leftJoin(products, eq(purchases.productId, products.id))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));

    return userPurchases;
  }

  async updatePurchaseStatus(id: string, status: string): Promise<void> {
    await db.update(purchases).set({ status }).where(eq(purchases.id, id));
  }

  async processPurchaseTransaction(
    userId: string,
    productId: string
  ): Promise<{ user: User; purchase: Purchase }> {
    return await db.transaction(async (tx) => {

      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for("update");

      if (!user) {
        throw new Error("المستخدم غير موجود");
      }

      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .for("update");

      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      if (!product.inStock) {
        throw new Error("المنتج غير متوفر");
      }


      if (user.coins < product.price) {
        throw new Error("ليس لديك كوينات كافية");
      }


      if (product.stock !== null && product.stock <= 0) {
        throw new Error("المنتج غير متوفر");
      }


      const [purchase] = await tx
        .insert(purchases)
        .values({
          userId: user.id,
          productId: product.id,
          price: product.price,
        })
        .returning();


      const newCoins = user.coins - product.price;
      const [updatedUser] = await tx
        .update(users)
        .set({ coins: newCoins })
        .where(eq(users.id, userId))
        .returning();


      if (product.stock !== null && product.stock > 0) {
        await tx
          .update(products)
          .set({ stock: product.stock - 1, inStock: product.stock - 1 > 0 })
          .where(eq(products.id, productId));
      }

      return { user: updatedUser, purchase };
    });
  }
}

export const storage = new DatabaseStorage();

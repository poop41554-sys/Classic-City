import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import csurf from "csurf";
import { randomBytes } from "crypto";
import { z } from "zod";
import {
  loginWithCodeSchema,
  updateCoinsSchema,
  purchaseProductSchema,
  insertProductSchema,
} from "@shared/schema";
import type { Product, User } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const blackCarImage =
  "/attached_assets/generated_images/black_luxury_sports_car.png";
const orangeCarImage =
  "/attached_assets/generated_images/orange_muscle_car.png";
const greenSuvImage =
  "/attached_assets/generated_images/green_off-road_suv.png";
const blueMotorcycleImage =
  "/attached_assets/generated_images/blue_sport_motorcycle.png";
const vipCrownImage = "/attached_assets/generated_images/golden_vip_crown.png";
const shieldBadgeImage =
  "/attached_assets/generated_images/premium_shield_badge.png";
const speedBoostImage =
  "/attached_assets/generated_images/speed_boost_icon.png";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "يجب تسجيل الدخول" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "يجب تسجيل الدخول" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "غير مصرح" });
  }

  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production" ? false : "http://localhost:5000",
      credentials: true,
    }),
  );

  app.use(cookieParser());

  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    }),
  );

  const csrfProtection = csurf({ cookie: false });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: (req) => req.path === "/api/user" || req.path === "/api/products",
    handler: (req, res) => {
      res.status(429).json({ message: "عدد الطلبات كثير جداً" });
    },
  });
  app.use("/api/", limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
  });

  app.get("/api/auth/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "فشل تحميل بيانات المستخدم" });
    }
  });

  app.post(
    "/api/auth/login-code",
    authLimiter,
    csrfProtection,
    async (req, res) => {
      try {
        const { code } = loginWithCodeSchema.parse(req.body);

        const loginCode = await storage.getLoginCodeByCode(code);
        if (!loginCode) {
          return res.status(401).json({ message: "الكود غير صحيح" });
        }

        if (loginCode.used) {
          return res.status(401).json({ message: "الكود مستخدم بالفعل" });
        }

        if (new Date(loginCode.expiresAt) < new Date()) {
          return res.status(401).json({ message: "الكود منتهي الصلاحية" });
        }

        let user = await storage.getUserByUsername(loginCode.username);
        if (!user) {
          user = await storage.createUser({
            username: loginCode.username,
          });
        }

        await storage.markLoginCodeAsUsed(loginCode.id, user.id);

        req.session.userId = user.id;

        res.json(user);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "بيانات غير صحيحة" });
        }
        console.error("Login error:", error);
        res.status(500).json({ message: "حدث خطأ في تسجيل الدخول" });
      }
    },
  );

  app.get("/api/auth/discord", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const protocol = req.get("x-forwarded-proto") || "https";
    const host = req.get("x-forwarded-host") || req.get("host");
    const redirectUri = `${protocol}://${host}/api/auth/discord/callback`;
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.redirect("/?error=no_code");
      }

      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const protocol = req.get("x-forwarded-proto") || "https";
      const host = req.get("x-forwarded-host") || req.get("host");
      const redirectUri = `${protocol}://${host}/api/auth/discord/callback`;

      const tokenResponse = await fetch(
        "https://discord.com/api/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            grant_type: "authorization_code",
            code: code as string,
            redirect_uri: redirectUri,
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return res.redirect("/?error=no_token");
      }

      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const discordUser = await userResponse.json();

      let user = await storage.getUserByDiscordId(discordUser.id);
      if (!user) {
        user = await storage.createUser({
          username: discordUser.username,
          discordId: discordUser.id,
          discordAvatar: discordUser.avatar,
          discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
        });
      }

      req.session.userId = user.id;

      res.redirect("/");
    } catch (error) {
      console.error("Discord OAuth error:", error);
      res.redirect("/?error=oauth_failed");
    }
  });

  app.post("/api/auth/logout", csrfProtection, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "فشل تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  app.get("/api/products", async (req, res) => {
    try {
      const allProducts = await storage.getAllProducts();
      res.json(allProducts);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "فشل تحميل المنتجات" });
    }
  });

  app.post("/api/purchases", requireAuth, csrfProtection, async (req, res) => {
    try {
      const { productId } = purchaseProductSchema.parse(req.body);

      const result = await storage.processPurchaseTransaction(
        req.session.userId!,
        productId,
      );

      res.json({ purchase: result.purchase, user: result.user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة" });
      }

      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }

      console.error("Purchase error:", error);
      res.status(500).json({ message: "فشل إتمام عملية الشراء" });
    }
  });

  app.get("/api/purchases", requireAuth, async (req, res) => {
    try {
      const userPurchases = await storage.getUserPurchases(req.session.userId!);
      res.json(userPurchases);
    } catch (error) {
      console.error("Get purchases error:", error);
      res.status(500).json({ message: "فشل تحميل المشتريات" });
    }
  });

  app.patch("/api/purchases/:id/status", requireAuth, csrfProtection, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["delivered", "cancelled", "pending"].includes(status)) {
        return res.status(400).json({ message: "حالة غير صحيحة" });
      }

      await storage.updatePurchaseStatus(id, status);

      const userPurchases = await storage.getUserPurchases(req.session.userId!);
      res.json({ message: "تم تحديث الحالة", purchases: userPurchases });
    } catch (error) {
      console.error("Update purchase status error:", error);
      res.status(500).json({ message: "فشل تحديث حالة الشراء" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "فشل تحميل المستخدمين" });
    }
  });

  app.post(
    "/api/admin/coins",
    requireAdmin,
    csrfProtection,
    async (req, res) => {
      try {
        const { userId, amount } = updateCoinsSchema.parse(req.body);

        const targetUser = await storage.getUser(userId);
        if (!targetUser) {
          return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        const newCoins = Math.max(0, targetUser.coins + amount);
        const updatedUser = await storage.updateUserCoins(userId, newCoins);

        res.json(updatedUser);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "بيانات غير صحيحة" });
        }
        console.error("Update coins error:", error);
        res.status(500).json({ message: "فشل تحديث الكوينات" });
      }
    },
  );

  app.post("/api/bot/coins", async (req, res) => {
    try {
      const adminSecret = process.env.ADMIN_SECRET;
      const providedSecret = req.headers["x-admin-secret"];

      if (!adminSecret || providedSecret !== adminSecret) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid secret" });
      }

      const { discordId, amount } = req.body;

      if (!discordId || amount === undefined) {
        return res
          .status(400)
          .json({ message: "discordId and amount are required" });
      }

      const targetUser = await storage.getUserByDiscordId(discordId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const newCoins = Math.max(0, targetUser.coins + amount);
      const updatedUser = await storage.updateUserCoins(
        targetUser.id,
        newCoins,
      );

      res.json({
        success: true,
        username: updatedUser.username,
        newBalance: updatedUser.coins,
        message: `Coins updated successfully`,
      });
    } catch (error) {
      console.error("Bot coins error:", error);
      res.status(500).json({ message: "Failed to update coins" });
    }
  });

  app.post("/api/mta/generate-code", async (req, res) => {
    try {
      const { username, apiKey } = req.body;

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const code = randomBytes(4).toString("hex").toUpperCase();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const loginCode = await storage.createLoginCode({
        code,
        username,
        expiresAt,
      });

      res.json({ code: loginCode.code, expiresAt: loginCode.expiresAt });
    } catch (error) {
      console.error("Generate code error:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });

  app.get("/api/mta/pending-purchases/:username", async (req, res) => {
    try {
      const { username } = req.params;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.json([]);
      }

      const userPurchases = await storage.getUserPurchases(user.id);
      const pending = userPurchases.filter((p) => p.status === "pending");

      res.json(pending);
    } catch (error) {
      console.error("Get pending purchases error:", error);
      res.status(500).json({ message: "Failed to get purchases" });
    }
  });

  app.post("/api/mta/deliver-purchase", async (req, res) => {
    try {
      const { purchaseId, apiKey } = req.body;

      if (!purchaseId) {
        return res.status(400).json({ message: "Purchase ID is required" });
      }

      await storage.updatePurchaseStatus(purchaseId, "delivered");

      res.json({ success: true });
    } catch (error) {
      console.error("Deliver purchase error:", error);
      res.status(500).json({ message: "Failed to deliver purchase" });
    }
  });

  app.post("/api/seed", async (req, res) => {
    try {
      const existingProducts = await storage.getAllProducts();
      if (existingProducts.length > 0) {
        return res.json({ message: "Products already seeded" });
      }

      const seedProducts: Omit<Product, "id" | "createdAt">[] = [
        {
          name: "سيارة فيراري سوداء",
          nameEn: "Black Ferrari",
          description: "",
          category: "vehicles",
          price: 5000,
          image: blackCarImage,
          inStock: true,
          isNew: true,
          isFeatured: true,
        },
        {
          name: "دودج تشارجر برتقالي",
          nameEn: "Orange Dodge Charger",
          description: "",
          category: "vehicles",
          price: 3500,
          image: orangeCarImage,
          inStock: true,
          isNew: false,
          isFeatured: true,
        },
        {
          name: "سيارة دفع رباعي خضراء",
          nameEn: "Green 4x4 SUV",
          description: "",
          category: "vehicles",
          price: 4000,
          image: greenSuvImage,
          inStock: true,
          isNew: false,
          isFeatured: false,
        },
        {
          name: "دراجة نارية رياضية",
          nameEn: "Sport Motorcycle",
          description: "",
          category: "vehicles",
          price: 2500,
          image: blueMotorcycleImage,
          inStock: true,
          isNew: true,
          isFeatured: false,
        },
        {
          name: "تاج VIP الذهبي",
          nameEn: "Golden VIP Crown",
          description: "احصل على تاج VIP ذهبي مميز يظهر بجانب اسمك",
          category: "features",
          price: 1500,
          image: vipCrownImage,
          inStock: true,
          isNew: false,
          isFeatured: true,
        },
        {
          name: "درع الحماية المميز",
          nameEn: "Premium Shield",
          description: "درع حماية يمنحك مناعة ضد الهجمات لمدة محددة",
          category: "features",
          price: 1000,
          image: shieldBadgeImage,
          inStock: true,
          isNew: false,
          isFeatured: false,
        },
        {
          name: "تعزيز السرعة",
          nameEn: "Speed Boost",
          description: "احصل على تعزيز دائم للسرعة في جميع المركبات",
          category: "features",
          price: 800,
          image: speedBoostImage,
          inStock: true,
          isNew: true,
          isFeatured: false,
        },
        {
          name: "صلاحيات المشرف",
          nameEn: "Moderator Permissions",
          description: "احصل على صلاحيات المشرف في الخادم",
          category: "ownership",
          price: 10000,
          image: shieldBadgeImage,
          inStock: true,
          isNew: false,
          isFeatured: false,
        },
      ];

      for (const product of seedProducts) {
        await storage.createProduct(product);
      }

      res.json({
        message: "Products seeded successfully",
        count: seedProducts.length,
      });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Failed to seed products" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

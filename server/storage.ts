import { users, images, categories, type User, type InsertUser, type Image, type InsertImage, type Category, type InsertCategory, API_SOURCES } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm"; // Import asc and desc

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Add image operations
  getImage(id: number): Promise<Image | undefined>;
  getImages(params: { page: number; limit: number; category?: string; sortBy?: string; sortOrder?: string; }): Promise<Image[]>; // Modified
  createImage(image: InsertImage): Promise<Image | null>; // Modified

  // Add category operations
  getCategories(): Promise<Category[]>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getOrCreateCategory(category: InsertCategory): Promise<Category>;
  populateCategories(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }

  async getImages(params: { page: number; limit: number; category?: string; sortBy?: string; sortOrder?: string; }): Promise<Image[]> {
    const { page, limit, category, sortBy = "createdAt", sortOrder = "desc" } = params;
    
    let orderByClause;
    // For now, only 'createdAt' is a valid sortBy field.
    if (sortBy === "createdAt") {
      orderByClause = sortOrder === "asc" ? asc(images.createdAt) : desc(images.createdAt);
    } else {
      // Default or fallback if sortBy is invalid/not supported
      orderByClause = desc(images.createdAt); 
    }

    let query = db.select()
      .from(images)
      .orderBy(orderByClause)
      .limit(limit)
      .offset((page - 1) * limit);

    if (category) {
      query = query.where(eq(images.category, category));
    }
    
    return query;
  }

  async createImage(insertImage: InsertImage): Promise<Image | null> {
    // Check if image with the same URL already exists
    const existingImage = await db.select().from(images).where(eq(images.url, insertImage.url)).limit(1);
    if (existingImage.length > 0) {
      console.log(`Image with URL ${insertImage.url} already exists.`);
      return null; // Image already exists
    }

    // Ensure createdAt is part of insertImage or handled by DB default
    const imageToInsert = {
        ...insertImage,
        // createdAt will be handled by defaultNow() in the schema if not provided
    };

    const [image] = await db
      .insert(images)
      .values(imageToInsert)
      .returning();
    return image;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getOrCreateCategory(insertCategory: InsertCategory): Promise<Category> {
    // Use the name from insertCategory for checking
    const existingCategory = await db.select().from(categories).where(eq(categories.name, insertCategory.name)).limit(1);
    if (existingCategory.length > 0) {
      return existingCategory[0];
    }
    // If not found, create it using the provided insertCategory data
    const [newCategory] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return newCategory;
  }

  async populateCategories(): Promise<void> {
    const categoriesToPopulate: { name: string; apiSource: (typeof API_SOURCES)[keyof typeof API_SOURCES]; isNsfw: boolean; originalName?: string }[] = [
      // Waifu Pics API - names will be prefixed
      { originalName: "waifu", name: "waifu_waifu", apiSource: API_SOURCES.WAIFU_PICS, isNsfw: true },
      { originalName: "neko", name: "waifu_neko", apiSource: API_SOURCES.WAIFU_PICS, isNsfw: true },
      { originalName: "blowjob", name: "waifu_blowjob", apiSource: API_SOURCES.WAIFU_PICS, isNsfw: true },
      // NSFW API - names are direct
      { name: "anal", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "ass", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "blowjob", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "breeding", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "buttplug", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "cages", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "ecchi", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "feet", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "fo", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "gif", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "hentai", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "legs", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "masturbation", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "milf", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "neko", apiSource: API_SOURCES.NSFW_API, isNsfw: true }, // This 'neko' is distinct from 'waifu_neko'
      { name: "paizuri", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "petgirls", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "pierced", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "selfie", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "smothering", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "socks", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "vagina", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
      { name: "yuri", apiSource: API_SOURCES.NSFW_API, isNsfw: true },
    ];

    for (const cat of categoriesToPopulate) {
      // The name in `cat` is already the final name to be inserted (e.g., "waifu_waifu" or "neko")
      const categoryNameToInsert = cat.name;

      const existing = await db.select().from(categories)
        .where(eq(categories.name, categoryNameToInsert)) // Check by the final name
        .limit(1);

      if (existing.length === 0) {
        // Use the final name for insertion
        await this.createCategory({ name: categoryNameToInsert, apiSource: cat.apiSource, isNsfw: cat.isNsfw });
        console.log(`Category ${categoryNameToInsert} (source: ${cat.apiSource}) inserted.`);
      } else {
        console.log(`Category ${categoryNameToInsert} (source: ${cat.apiSource}) already exists.`);
      }
    }
    console.log("Category population process finished.");
  }
}

export const storage = new DatabaseStorage();
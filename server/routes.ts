import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { API_SOURCES, type InsertImage } from "@shared/schema";
import nodeFetch from 'node-fetch'; // For making HTTP requests in Node.js

export function registerRoutes(app: Express): Server {
  // put application routes here
  // prefix all routes with /api

  app.get("/api/categories", async (_req, res, next) => {
    try {
      const allCategories = await storage.getCategories();
      res.json(allCategories);
    } catch (error) {
      next(error);
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Helper function to fetch image from external API (similar to client)
  async function fetchExternalImage(apiSource: string, categoryName: string | null): Promise<Partial<InsertImage> | null> {
    const apiEndpoints = {
      [API_SOURCES.NSFW_API]: 'https://api.n-sfw.com/nsfw/',
      [API_SOURCES.WAIFU_PICS]: 'https://api.waifu.pics/nsfw/',
      [API_SOURCES.NEKOS_MOE]: 'https://nekos.moe/api/v1/random/image'
    };

    let actualCategory = categoryName;
    let endpoint = '';

    if (apiSource === API_SOURCES.WAIFU_PICS) {
      // Client uses "waifu_category", DB stores "waifu_category", API needs "category"
      actualCategory = categoryName?.replace('waifu_', '') || 'waifu'; // Default to 'waifu' if categoryName is null
      endpoint = `${apiEndpoints[API_SOURCES.WAIFU_PICS]}${actualCategory}`;
    } else if (apiSource === API_SOURCES.NSFW_API) {
      // Client might send "neko", DB stores "neko" for nsfw_api, API needs "neko"
      actualCategory = categoryName || 'hentai'; // Default to 'hentai' if no category for nsfw
      endpoint = `${apiEndpoints[API_SOURCES.NSFW_API]}${actualCategory}`;
    } else if (apiSource === API_SOURCES.NEKOS_MOE) {
      // Nekos.moe doesn't use categories in the same way, it's always random nsfw/sfw based on endpoint
      // For now, let's assume if nekos.moe is chosen, category is ignored for fetching url
      endpoint = apiEndpoints[API_SOURCES.NEKOS_MOE];
      actualCategory = 'random_nekos_moe'; // Placeholder category for DB
    } else {
      return null; // Unknown API source
    }
    
    try {
      const response = await nodeFetch(endpoint);
      if (!response.ok) {
        console.error(`Failed to fetch from ${endpoint}: ${response.statusText}`);
        return null;
      }
      const data: any = await response.json();
      let imageUrl = '';
      let width: number | undefined = undefined;
      let height: number | undefined = undefined;

      if (apiSource === API_SOURCES.WAIFU_PICS) {
        imageUrl = data.url;
      } else if (apiSource === API_SOURCES.NEKOS_MOE && data.images?.[0]) {
        imageUrl = `https://nekos.moe/image/${data.images[0].id}`; // .jpg is not always the case, but client uses it.
                                                                    // For simplicity, we'll stick to this.
        // Note: Nekos.moe API response for random image does not provide width/height directly.
        // It provides image ID and tags. Actual image dimensions would require another fetch or image processing.
      } else if (apiSource === API_SOURCES.NSFW_API) {
        imageUrl = data.url_japan; // Assuming this is the desired field
                                  // n-sfw API also doesn't provide dimensions directly in this endpoint
      }

      if (imageUrl) {
        return {
          url: imageUrl,
          apiSource: apiSource,
          category: actualCategory || 'unknown', // Ensure category is not null
          // Width and height are often not available directly from these simple GET requests
          // Setting placeholder values or fetching them would be a separate, more complex task.
          width: width || 0, // Placeholder
          height: height || 0, // Placeholder
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching from ${apiSource} with category ${categoryName}:`, error);
      return null;
    }
  }

  app.get("/api/images", async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string | undefined;
    const sortBy = req.query.sortBy as string || "createdAt"; // Default to createdAt
    const sortOrder = req.query.sortOrder as string || "desc"; // Default to desc

    const IMAGES_TO_FETCH_PER_REQUEST = 5; // Number of images to try fetching from external APIs

    try {
      if (category) {
        // Fetch for a specific category
        // Determine apiSource from category name if possible, or use a default.
        // This logic assumes category names are unique or prefixed like 'waifu_neko'
        let apiSourceToUse: string = API_SOURCES.NSFW_API; // Default
        let categoryForApi = category;

        if (category.startsWith('waifu_')) {
          apiSourceToUse = API_SOURCES.WAIFU_PICS;
          // categoryForApi is already 'waifu_xyz', fetchExternalImage will strip prefix
        }
        // Add more rules if other apiSources have specific category prefixes
        
        for (let i = 0; i < IMAGES_TO_FETCH_PER_REQUEST; i++) {
          const fetchedImage = await fetchExternalImage(apiSourceToUse, categoryForApi);
          if (fetchedImage) {
            await storage.createImage(fetchedImage as InsertImage);
          }
        }
      } else {
        // Fetch a mix if no category is specified
        const sources = [API_SOURCES.NSFW_API, API_SOURCES.WAIFU_PICS, API_SOURCES.NEKOS_MOE];
        // For simplicity, fetch a few from a randomly chosen source. A more balanced approach might be needed.
        for (let i = 0; i < IMAGES_TO_FETCH_PER_REQUEST; i++) {
           const randomSource = sources[Math.floor(Math.random() * sources.length)];
           let randomCategory: string | null = null;
           
           // Crude way to get a random category for the chosen source
           if (randomSource === API_SOURCES.WAIFU_PICS) {
             const waifuCategories = ["waifu_waifu", "waifu_neko", "waifu_blowjob"];
             randomCategory = waifuCategories[Math.floor(Math.random() * waifuCategories.length)];
           } else if (randomSource === API_SOURCES.NSFW_API) {
             const nsfwCategories = ["anal", "ass", "blowjob", "hentai", "neko"]; // A small subset for example
             randomCategory = nsfwCategories[Math.floor(Math.random() * nsfwCategories.length)];
           }
           // nekos.moe doesn't need a category for fetching its random image.

           const fetchedImage = await fetchExternalImage(randomSource, randomCategory);
           if (fetchedImage) {
             await storage.createImage(fetchedImage as InsertImage);
           }
        }
      }

      // After attempting to fetch and store new images, retrieve from DB
      const imagesFromDb = await storage.getImages({ page, limit, category, sortBy, sortOrder });
      res.json(imagesFromDb);

    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  // put application routes here
  // prefix all routes with /api

  app.get("/api/download", async (req, res) => {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).send("Missing or invalid URL");
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).send(response.statusText);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const extension = contentType.split("/")[1] || "jpg";
      const filename = `image-${Date.now()}.${extension}`;

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      response.body.pipe(res);
    } catch (error) {
      console.error("Error downloading image:", error);
      res.status(500).send("Error downloading image");
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

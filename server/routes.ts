import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import https from 'https';
import path from 'path';
import { parse } from 'url';

export function registerRoutes(app: Express): Server {
  // put application routes here
  // prefix all routes with /api

  app.get('/download', async (req, res) => {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).send('Image URL is required');
    }

    try {
      https.get(imageUrl, (imageResponse) => {
        if (imageResponse.statusCode !== 200) {
          res.status(imageResponse.statusCode || 500).send('Failed to download image');
          return;
        }

        const parsedUrl = parse(imageUrl);
        const filename = path.basename(parsedUrl.pathname || 'image.jpg');

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (imageResponse.headers['content-type']) {
          res.setHeader('Content-Type', imageResponse.headers['content-type']);
        }

        imageResponse.pipe(res);
      }).on('error', (error) => {
        console.error('Error proxying download:', error);
        res.status(500).send('Failed to download image');
      });
    } catch (error) {
      console.error('Error proxying download:', error);
      res.status(500).send('Failed to download image');
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

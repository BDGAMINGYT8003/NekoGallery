import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from 'axios';

export function registerRoutes(app: Express): Server {
  // put application routes here
  // prefix all routes with /api

  app.get('/api/download', async (req, res) => {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).send('Image URL is required');
    }

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
      });

      // Pass content type from the source to the client
      res.setHeader('Content-Type', response.headers['content-type']);

      // Pipe the image stream to the response
      response.data.pipe(res);

    } catch (error) {
      console.error('Error downloading image:', error);
      res.status(500).send('Failed to download image');
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

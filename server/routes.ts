import type { Express } from "express";
import { createServer, type Server } from "http";
import http from 'http';
import https from 'https';
import path from 'path';
import { parse } from 'url';
import { storage } from "./storage";

const getRequestClient = (protocol: string | null) => {
  if (protocol === 'https:') {
    return https;
  }
  return http;
}

export function registerRoutes(app: Express): Server {
  app.get('/download', (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('Image URL is required');
    }

    const parsedUrl = parse(imageUrl);
    const client = getRequestClient(parsedUrl.protocol);

    const request = client.get(imageUrl, (imageResponse) => {
      if (imageResponse.statusCode && imageResponse.statusCode >= 300 && imageResponse.statusCode < 400 && imageResponse.headers.location) {
        const redirectUrl = imageResponse.headers.location;
        const redirectParsedUrl = parse(redirectUrl);
        const redirectClient = getRequestClient(redirectParsedUrl.protocol);

        redirectClient.get(redirectUrl, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            return res.status(redirectResponse.statusCode || 500).send('Failed to download image after redirect.');
          }
          const filename = path.basename(redirectParsedUrl.pathname || 'image.jpg');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          if (redirectResponse.headers['content-type']) {
            res.setHeader('Content-Type', redirectResponse.headers['content-type']);
          }
          redirectResponse.pipe(res);
        }).on('error', (err) => {
          console.error('Error during redirect download:', err.message);
          res.status(500).send('Failed to download image.');
        });
        return;
      }

      if (imageResponse.statusCode !== 200) {
        return res.status(imageResponse.statusCode || 500).send('Failed to download image.');
      }

      const filename = path.basename(parsedUrl.pathname || 'image.jpg');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      if (imageResponse.headers['content-type']) {
        res.setHeader('Content-Type', imageResponse.headers['content-type']);
      }
      imageResponse.pipe(res);
    });

    request.on('error', (err) => {
      console.error('Error proxying download:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Failed to download image.');
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

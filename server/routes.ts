import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import commentsRouter from "./routes/comments";

export function registerRoutes(app: Express): Server {
  // Регистрируем маршруты для работы с комментариями
  app.use("/api/comments", commentsRouter);

  // Другие маршруты можно добавить здесь
  
  const httpServer = createServer(app);

  return httpServer;
}

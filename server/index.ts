import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./api"; // Импортируем API роуты

// Загружаем переменные окружения
dotenv.config();

const app = express();

// Настройка CORS для разработки
app.use(
  cors({
    origin: true, // Разрешаем любые кросс-доменные запросы
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'X-Client-Info',
      'apikey',
      'X-Supabase-Auth',
      'Access-Control-Allow-Origin',
    ],
    maxAge: 86400, // Увеличенное время кэширования CORS (24 часа)
  })
);

// Добавляем middleware для логирования запросов
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Добавляем middleware для сессий
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 неделя
    }
  })
);

// Добавляем middleware для логирования
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Добавляем API роуты
app.use('/api', apiRoutes);

// Регистрируем основные маршруты через функцию registerRoutes
(async () => {
  // Регистрируем маршруты через функцию registerRoutes
  const server = registerRoutes(app);

  // Обработка ошибок
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Server Error:`, err);
    
    // Убедимся, что заголовки не были уже отправлены
    if (res.headersSent) {
      return _next(err);
    }

    // Форматируем ошибку как JSON
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    
    // Всегда возвращаем JSON-ответ
    res.status(status).json({
      success: false,
      message: message,
      error: {
        type: err.name || 'ServerError',
        ...(stack && { stack }),
        details: err.details || undefined,
      },
      timestamp
    });
  });

  // Убедимся, что все другие маршруты, которые не совпали, вернут JSON-ответ для API
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Настройка Vite для разработки или статических файлов для продакшена
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Запуск сервера
  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT} in ${app.get("env")} mode`);
    log(`Supabase URL: ${process.env.SUPABASE_URL ? "configured" : "missing"}`);
  });
})();
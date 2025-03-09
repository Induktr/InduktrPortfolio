import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // В Vercel мы пытаемся найти директорию в нескольких местах
  let distPath;
  const possiblePaths = [
    // Локальная разработка
    path.resolve(__dirname, "public"),
    // Vercel - попробуем разные пути
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(__dirname, "../public"),
    path.resolve(__dirname, "../dist/public")
  ];

  // Найдем первый существующий путь
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      log(`Found static files at: ${distPath}`);
      break;
    }
  }

  // Если ни один путь не найден, используем default
  if (!distPath) {
    log("Warning: Could not find build directory, using default");
    distPath = path.resolve(process.cwd(), "dist/public");
  }

  // Настройка статических файлов
  app.use(express.static(distPath, {
    maxAge: 31536000000 // 1 год в миллисекундах для кеширования статических ресурсов
  }));

  // Определяем клиентские маршруты SPA
  const clientRoutes = ['/projects', '/tools', '/blog', '/signin', '/signup', '/profile'];
  
  // Явно обрабатываем клиентские маршруты
  clientRoutes.forEach(route => {
    app.get(route, (req, res) => {
      log(`SPA route requested: ${req.path}`);
      try {
        res.sendFile(path.join(distPath, "index.html"));
      } catch (error) {
        log(`Error serving index.html for ${req.path}: ${error}`);
        res.status(500).send("Internal Server Error");
      }
    });
  });

  // Обрабатываем все остальные запросы, направляя их на index.html
  app.use("*", (req, res) => {
    log(`Fallback route requested: ${req.path}`);
    try {
      res.sendFile(path.join(distPath, "index.html"));
    } catch (error) {
      log(`Error serving index.html for fallback route ${req.path}: ${error}`);
      res.status(500).send("Internal Server Error");
    }
  });
}

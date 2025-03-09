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
  try {
    log("Starting serveStatic function");
    
    // В Vercel мы пытаемся найти директорию в нескольких местах
    let distPath = null;
    const possiblePaths = [
      // Vercel - попробуем разные пути
      path.join(process.cwd(), "dist", "public"),
      path.join(process.cwd(), "public"),
      // Локальная разработка
      path.join(__dirname, "public"),
      path.join(__dirname, "..", "dist", "public"),
      path.join(__dirname, "..", "public")
    ];

    // Логируем все возможные пути для диагностики
    log(`Current working directory: ${process.cwd()}`);
    log(`Current __dirname: ${__dirname}`);
    log(`Checking these paths:`);
    possiblePaths.forEach((p, index) => {
      log(`Path ${index + 1}: ${p} - Exists: ${fs.existsSync(p)}`);
    });

    // Найдем первый существующий путь
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        distPath = p;
        log(`Found static files at: ${distPath}`);
        break;
      }
    }

    // Если ни один путь не найден, используем дефолтный
    if (!distPath) {
      log("Warning: Could not find build directory, using default");
      distPath = path.join(process.cwd(), "dist", "public");
      
      // Попробуем создать директорию, если она не существует
      try {
        if (!fs.existsSync(distPath)) {
          log(`Creating directory: ${distPath}`);
          fs.mkdirSync(distPath, { recursive: true });
        }
      } catch (error) {
        log(`Error creating directory: ${error}`);
      }
    }

    // Проверим содержимое директории
    try {
      const files = fs.readdirSync(distPath);
      log(`Files in ${distPath}: ${files.join(', ')}`);
      
      // Проверим наличие index.html
      const indexPath = path.join(distPath, "index.html");
      const indexExists = fs.existsSync(indexPath);
      log(`index.html exists: ${indexExists}`);
      
      if (!indexExists) {
        // Если index.html не существует, создадим заглушку
        log("Creating fallback index.html");
        const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fallback Page</title>
</head>
<body>
  <h1>Fallback Index Page</h1>
  <p>This is a fallback page created because the original index.html was not found.</p>
</body>
</html>`;
        fs.writeFileSync(indexPath, fallbackHtml);
      }
    } catch (error) {
      log(`Error checking directory contents: ${error}`);
    }

    // Настройка статических файлов
    app.use(express.static(distPath, {
      maxAge: 31536000000 // 1 год в миллисекундах для кеширования статических ресурсов
    }));

    // Простой обработчик для корневого маршрута
    app.get('/', (req, res) => {
      log('Root route requested');
      try {
        res.sendFile(path.join(distPath, "index.html"));
      } catch (error) {
        log(`Error serving index.html for root route: ${error}`);
        res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Induktr</title>
          </head>
          <body>
            <h1>Welcome to Induktr</h1>
            <p>This is a fallback page.</p>
          </body>
          </html>
        `);
      }
    });

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
          res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Induktr - ${req.path}</title>
            </head>
            <body>
              <h1>Induktr - ${req.path}</h1>
              <p>This is a fallback page for the ${req.path} route.</p>
            </body>
            </html>
          `);
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
        res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Induktr - ${req.path}</title>
          </head>
          <body>
            <h1>Induktr - Fallback</h1>
            <p>This is a fallback page for the ${req.path} route.</p>
          </body>
          </html>
        `);
      }
    });
    
    log("serveStatic function completed successfully");
  } catch (error) {
    log(`Fatal error in serveStatic: ${error}`);
    
    // Добавляем экстренный обработчик для всех маршрутов
    app.use("*", (req, res) => {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Error Recovery</title>
        </head>
        <body>
          <h1>Emergency Fallback Page</h1>
          <p>The server encountered an error but is recovering.</p>
          <p>Requested path: ${req.path}</p>
        </body>
        </html>
      `);
    });
  }
}

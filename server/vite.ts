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
    log("Starting serveStatic function in API mode");
    
    // В продакшене мы позволяем Vercel настройкам обрабатывать статические файлы
    // и отвечаем только за API маршруты
    if (process.env.NODE_ENV === 'production') {
      // Добавим обработчик, который логирует все API запросы
      app.use('/api', (req, res, next) => {
        log(`API request: ${req.method} ${req.path}`);
        next();
      });
      
      // Все другие маршруты, которые достигают сервера
      app.use('*', (req, res) => {
        log(`Non-API request reached server: ${req.method} ${req.originalUrl}`);
        res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>API Server</title>
          </head>
          <body>
            <h1>API Server</h1>
            <p>This endpoint is the API server. Client-side routes should be handled by Vercel routing.</p>
            <p>Requested path: ${req.originalUrl}</p>
          </body>
          </html>
        `);
      });
      
      return;
    }
    
    // В режиме разработки обрабатываем статические файлы как обычно
    const distPath = path.resolve(__dirname, "..", "dist", "public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      log(`Serving static files from ${distPath}`);
    } else {
      log(`Warning: Could not find build directory: ${distPath}`);
    }
    
    app.use("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Not found");
      }
    });
    
    log("serveStatic function completed");
  } catch (error) {
    log(`Error in serveStatic: ${error}`);
    
    // Обработчик ошибок
    app.use("*", (req, res) => {
      res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Server Error</title>
        </head>
        <body>
          <h1>Server Error</h1>
          <p>The server encountered an error.</p>
          <p>Requested path: ${req.originalUrl}</p>
        </body>
        </html>
      `);
    });
  }
}

import express from 'express';
import handleSupabaseStatus from './supabase-status';
import handleSignUp from './auth/signup';
import handleSignIn from './auth/signin';
import handleGetCurrentUser from './auth/me';
import handleEnvCheck from './env-check';

// Роуты API
const router = express.Router();

// Промежуточное ПО для отлова ошибок JSON парсинга
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error(`[${new Date().toISOString()}] JSON Parse Error:`, err.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      error: err.message
    });
  }
  next(err);
});

// Базовый эндпоинт для проверки работоспособности API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Роут для проверки статуса Supabase
router.get('/supabase-status', handleSupabaseStatus);

// Роут для проверки переменных окружения
router.get('/env-check', handleEnvCheck);

// Auth endpoints
router.post('/auth/signup', handleSignUp);
router.post('/auth/signin', handleSignIn);
router.get('/auth/me', handleGetCurrentUser);

// Эндпоинт для получения информации о среде выполнения
router.get('/env-info', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Промежуточное ПО для обработки async ошибок в маршрутах
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Оборачиваем все маршруты в обработчик асинхронных ошибок
const wrapAsync = (router: express.Router) => {
  const methods = ['get', 'post', 'put', 'delete', 'patch'];
  const originalRouter = { ...router };
  
  methods.forEach(method => {
    const original = (router as any)[method];
    (router as any)[method] = function(path: string, ...handlers: Function[]) {
      const wrappedHandlers = handlers.map(handler => 
        typeof handler === 'function' ? asyncHandler(handler) : handler
      );
      return original.call(this, path, ...wrappedHandlers);
    };
  });
  
  return router;
};

// Применяем обертку для асинхронных маршрутов
wrapAsync(router);

// Обработчик 404 для API запросов
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Обработчик ошибок API
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[${new Date().toISOString()}] API Error:`, err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal API Error';
  
  res.status(status).json({
    success: false,
    message,
    error: {
      type: err.name || 'APIError',
      details: err.details || undefined,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
});

export default router; 
import { Router } from 'express';
import commentsRouter from './comments.js';

const router = Router();

// Подключаем все маршруты
router.use(commentsRouter);

export default router; 
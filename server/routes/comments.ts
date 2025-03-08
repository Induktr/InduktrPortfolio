import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Получить комментарии для конкретного инструмента
router.get("/", async (req, res) => {
  try {
    const toolName = req.query.tool as string;
    if (!toolName) {
      return res.status(400).json({ error: "Не указано имя инструмента" });
    }

    const comments = await storage.getToolComments(toolName);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Ошибка при получении комментариев" });
  }
});

// Добавить новый комментарий
router.post("/", async (req, res) => {
  try {
    const { toolName, comment, rating, username } = req.body;
    console.log("Received comment data:", { toolName, comment, rating, username });

    if (!toolName || !comment || !rating || !username) {
      return res.status(400).json({ error: "Не все поля заполнены" });
    }

    const newComment = await storage.addToolComment({
      tool_name: toolName,
      comment,
      rating,
      username
    });
    
    // Получаем информацию о пользователе для ответа
    const user = await storage.getUserByUsername(username);
    
    // Формируем ответ в формате, ожидаемом клиентом
    res.status(201).json({
      id: newComment.id,
      username,
      comment: newComment.comment,
      rating: newComment.rating,
      createdAt: newComment.created_at
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Ошибка при добавлении комментария" });
  }
});

export default router;
import { db, testDatabaseConnection } from "../db.js";
import { toolComments, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

// Get comments for a specific tool
router.get("/api/comments", async (req, res) => {
  try {
    console.log("GET /api/comments - Query params:", req.query);
    const toolName = req.query.tool as string;
    if (!toolName) {
      return res.status(400).json({ error: "Tool name is required" });
    }

    // Проверка подключения к базе данных
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    console.log("Fetching comments for tool:", toolName);
    const comments = await db
      .select({
        id: toolComments.id,
        username: users.username,
        comment: toolComments.comment,
        rating: toolComments.rating,
        createdAt: toolComments.createdAt,
      })
      .from(toolComments)
      .leftJoin(users, eq(toolComments.userId, users.id))
      .where(eq(toolComments.toolName, toolName));

    console.log("Found comments:", comments);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    // Более подробная информация об ошибке
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    res.status(500).json({ error: "Failed to fetch comments", details: error instanceof Error ? error.message : String(error) });
  }
});

// Add a new comment
router.post("/api/comments", async (req, res) => {
  try {
    console.log("POST /api/comments - Request body:", req.body);
    const { toolName, comment, rating } = req.body;
    console.log("Received comment data:", { toolName, comment, rating });

    if (!toolName || !comment || rating === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Проверка подключения к базе данных
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    // Get the default anonymous user or create one if it doesn't exist
    console.log("Looking for anonymous user");
    let user = await db
      .select()
      .from(users)
      .where(eq(users.username, "anonymous"))
      .limit(1);

    console.log("Anonymous user query result:", user);

    // If no anonymous user exists, create one
    if (user.length === 0) {
      console.log("Creating anonymous user");
      const insertedUser = await db
        .insert(users)
        .values({
          username: "anonymous",
          password: "anonymous_password",
        })
        .returning();
      
      user = insertedUser;
      console.log("Created anonymous user:", user);
    }

    console.log("Using user:", user[0]);
    const userId = user[0]?.id;

    if (!userId) {
      return res.status(500).json({ error: "Failed to get or create anonymous user" });
    }

    console.log("Inserting new comment with userId:", userId);
    const newComment = await db
      .insert(toolComments)
      .values({
        userId,
        toolName,
        comment,
        rating,
      })
      .returning();

    console.log("Created comment:", newComment[0]);
    res.json(newComment[0]);
  } catch (error) {
    console.error("Error posting comment:", error);
    // Более подробная информация об ошибке
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    res.status(500).json({ 
      error: "Failed to post comment", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;
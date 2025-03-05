import { db } from "../db";
import { toolComments, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

// Get comments for a specific tool
router.get("/api/comments", async (req, res) => {
  try {
    const toolName = req.query.tool as string;
    if (!toolName) {
      return res.status(400).json({ error: "Tool name is required" });
    }

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

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add a new comment
router.post("/api/comments", async (req, res) => {
  try {
    const { toolName, comment, rating } = req.body;
    console.log("Received comment data:", { toolName, comment, rating });

    // For development: Get the first user from the database
    const user = await db.select().from(users).limit(1);
    console.log("Found user:", user[0]);
    const userId = user[0]?.id;

    if (!userId) {
      return res.status(401).json({ error: "You must be logged in to comment" });
    }

    const newComment = await db.insert(toolComments).values({
      userId,
      toolName,
      comment,
      rating,
    }).returning();

    console.log("Created comment:", newComment[0]);
    res.json(newComment[0]);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ error: "Failed to post comment" });
  }
});

export default router;
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

// Update a comment
router.patch("/api/comments/:id", async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { comment, rating } = req.body;

    // For development: Get the first user
    const user = await db.select().from(users).limit(1);
    const userId = user[0]?.id;

    // Check if the comment exists and belongs to the user
    const existingComment = await db
      .select()
      .from(toolComments)
      .where(eq(toolComments.id, commentId))
      .limit(1);

    if (!existingComment.length) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment[0].userId !== userId) {
      return res.status(403).json({ error: "Not authorized to update this comment" });
    }

    const updatedComment = await db
      .update(toolComments)
      .set({
        comment,
        rating,
        updatedAt: new Date(),
      })
      .where(eq(toolComments.id, commentId))
      .returning();

    res.json(updatedComment[0]);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Delete a comment
router.delete("/api/comments/:id", async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    // For development: Get the first user
    const user = await db.select().from(users).limit(1);
    const userId = user[0]?.id;

    // Check if the comment exists and belongs to the user
    const existingComment = await db
      .select()
      .from(toolComments)
      .where(eq(toolComments.id, commentId))
      .limit(1);

    if (!existingComment.length) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment[0].userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await db
      .delete(toolComments)
      .where(eq(toolComments.id, commentId));

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
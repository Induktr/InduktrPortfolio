import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const toolComments = pgTable("tool_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolName: text("tool_name").notNull(),
  comment: text("comment").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

export const commentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  toolName: z.string(),
  comment: z.string().min(3),
  rating: z.number().min(1).max(5),
  createdAt: z.string().datetime(),
});

export type Comment = z.infer<typeof commentSchema>;

export const insertCommentSchema = commentSchema.omit({ id: true, userId: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type ToolComment = typeof toolComments.$inferSelect;
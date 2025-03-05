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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCommentSchema = createInsertSchema(toolComments)
  .pick({
    toolName: true,
    comment: true,
    rating: true,
  })
  .extend({
    rating: z.number().min(1).max(5),
    comment: z.string().min(3).max(1000),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type ToolComment = typeof toolComments.$inferSelect;
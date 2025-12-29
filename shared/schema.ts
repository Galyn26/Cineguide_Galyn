import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const snapshots = pgTable("snapshots", {
  id: serial("id").primaryKey(),
  advice: text("advice").notNull(),
  action: text("action"), // UP, DOWN, LEFT, RIGHT, etc.
  template: text("template"), // overhead, under-angle, etc.
  targetLocked: jsonb("target_locked"), // { x, y, width, height }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSnapshotSchema = createInsertSchema(snapshots).omit({ 
  id: true, 
  createdAt: true 
});

export type Snapshot = typeof snapshots.$inferSelect;
export type InsertSnapshot = z.infer<typeof insertSnapshotSchema>;

// API Types
export const analyzeRequestSchema = z.object({
  image: z.string(), // Base64 image
  template: z.string().optional(),
  targetLocked: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export interface AnalyzeResponse {
  action: "UP" | "DOWN" | "LEFT" | "RIGHT" | "FORWARD" | "BACKWARD" | "OK";
  advice: string;
}

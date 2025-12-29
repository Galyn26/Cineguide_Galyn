import { db } from "./db";
import {
  snapshots,
  type InsertSnapshot,
  type Snapshot
} from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot>;
  getSnapshots(): Promise<Snapshot[]>;
}

export class DatabaseStorage implements IStorage {
  async createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot> {
    const [newSnapshot] = await db.insert(snapshots).values(snapshot).returning();
    return newSnapshot;
  }

  async getSnapshots(): Promise<Snapshot[]> {
    return await db.select().from(snapshots).orderBy(desc(snapshots.createdAt));
  }
}

export const storage = new DatabaseStorage();

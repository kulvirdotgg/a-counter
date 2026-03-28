import { Database } from "bun:sqlite";

const db = new Database("counter.db");

// Initialize database
db.run(`
  CREATE TABLE IF NOT EXISTS mentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface MentionCount {
  name: string;
  count: number;
}

export function addMention(name: string): void {
  db.run("INSERT INTO mentions (name) VALUES (?)", [name]);
}

export function getCounts(): MentionCount[] {
  const result = db.query(`
    SELECT name, COUNT(*) as count 
    FROM mentions 
    GROUP BY name
  `).all() as MentionCount[];
  
  return result;
}

export function getCountsInTimeframe(minutes: number): MentionCount[] {
  const result = db.query(`
    SELECT name, COUNT(*) as count 
    FROM mentions 
    WHERE created_at >= datetime('now', '-${minutes} minutes')
    GROUP BY name
  `).all() as MentionCount[];
  
  return result;
}

export function resetCounts(): void {
  db.run("DELETE FROM mentions");
}

export default db;

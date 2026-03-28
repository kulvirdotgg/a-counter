import { Database } from "bun:sqlite";
import { readFileSync } from "fs";

// Initialize SQLite database
const db = new Database("mentions.db");

db.run(`
  CREATE TABLE IF NOT EXISTS mentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get counts with optional timeframe filter (in minutes)
function getCounts(timeframeMinutes?: number) {
  let query = `SELECT category, COUNT(*) as count FROM mentions`;
  
  if (timeframeMinutes) {
    query += ` WHERE created_at >= datetime('now', '-${timeframeMinutes} minutes')`;
  }
  
  query += ` GROUP BY category`;
  
  const results = db.query(query).all() as { category: string; count: number }[];
  
  const counts: Record<string, number> = {
    "mumbai-indians": 0,
    "kanye-west": 0,
  };
  
  for (const row of results) {
    counts[row.category] = row.count;
  }
  
  return counts;
}

// Add a mention
function addMention(category: string) {
  db.run(`INSERT INTO mentions (category) VALUES (?)`, [category]);
  return getCounts();
}

// Reset all mentions
function resetMentions() {
  db.run(`DELETE FROM mentions`);
  return getCounts();
}

// Serve the app
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // API Routes
    if (url.pathname === "/api/counts") {
      const timeframe = url.searchParams.get("timeframe");
      const counts = getCounts(timeframe ? parseInt(timeframe) : undefined);
      return Response.json(counts);
    }
    
    if (url.pathname === "/api/increment" && req.method === "POST") {
      const body = await req.json();
      const counts = addMention(body.category);
      return Response.json(counts);
    }
    
    if (url.pathname === "/api/reset" && req.method === "POST") {
      const counts = resetMentions();
      return Response.json(counts);
    }
    
    // Serve static files
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = readFileSync("public/index.html", "utf-8");
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);

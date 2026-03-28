import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { dirname, join, normalize } from "path";

const port = Number(Bun.env.PORT ?? "3000");
const databasePath = Bun.env.DATABASE_PATH ?? "data/counter.db";
const publicDir = join(import.meta.dir, "public");

mkdirSync(dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

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

function getStaticFile(pathname: string) {
  const requestedPath = pathname === "/" ? "index.html" : pathname.slice(1);
  const normalizedPath = normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(publicDir, normalizedPath);

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    return null;
  }

  return Bun.file(filePath);
}

// Serve the app
const server = Bun.serve({
  port,
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

    const staticFile = getStaticFile(url.pathname);

    if (staticFile) {
      return new Response(staticFile);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);

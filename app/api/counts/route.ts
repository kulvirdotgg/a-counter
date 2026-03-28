import { getCounts, getCountsInTimeframe } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe");
    
    let counts;
    if (timeframe && !isNaN(Number(timeframe))) {
      counts = getCountsInTimeframe(Number(timeframe));
    } else {
      counts = getCounts();
    }
    
    // Ensure both options are always present
    const mumbaiIndians = counts.find(c => c.name === "Mumbai Indians")?.count || 0;
    const kanyeWest = counts.find(c => c.name === "Kanye West")?.count || 0;
    
    return NextResponse.json({
      "Mumbai Indians": mumbaiIndians,
      "Kanye West": kanyeWest,
      total: mumbaiIndians + kanyeWest
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get counts" },
      { status: 500 }
    );
  }
}

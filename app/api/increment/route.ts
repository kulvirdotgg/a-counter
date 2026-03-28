import { addMention } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    if (!name || !["Mumbai Indians", "Kanye West"].includes(name)) {
      return NextResponse.json(
        { error: "Invalid name" },
        { status: 400 }
      );
    }
    
    addMention(name);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to increment" },
      { status: 500 }
    );
  }
}

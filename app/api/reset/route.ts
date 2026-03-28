import { resetCounts } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    resetCounts();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset" },
      { status: 500 }
    );
  }
}

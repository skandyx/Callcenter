import { NextResponse } from "next/server";
import { callDataStore } from "@/lib/call-data-store";

export async function GET() {
  // This endpoint now returns the data that has been pushed to the /api/stream endpoint.
  // Note: For a real production app, this in-memory store would be replaced by a database.
  return NextResponse.json(callDataStore);
}

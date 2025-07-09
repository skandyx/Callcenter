import { NextResponse } from "next/server";
import { type CallData } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

// Define the path to the data file
const dataFilePath = path.join(process.cwd(), "call-data.json");

async function readData(): Promise<CallData[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, which is fine. Return an empty array.
      return [];
    }
    // For other errors, log them and return an empty array.
    console.error("Error reading data file:", error);
    return [];
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}
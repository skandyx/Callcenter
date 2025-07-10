import { NextResponse } from "next/server";
import { type AdvancedCallData } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "advanced-call-data.json");

async function readData(): Promise<AdvancedCallData[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error("Error reading advanced call data file:", error);
    return [];
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

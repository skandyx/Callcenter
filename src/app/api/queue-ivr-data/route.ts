
import { NextResponse } from "next/server";
import { type QueueIvrData } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "queue-ivr-data.json");

async function readData(): Promise<QueueIvrData[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error("Error reading queue/IVR data file:", error);
    return [];
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}


import { NextResponse } from "next/server";
import { type AdvancedCallData } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "Datas-json");
const dataFilePath = path.join(dataDir, "advanced-call-data.json");

async function readData(): Promise<AdvancedCallData[]> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, "[]", "utf8");
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

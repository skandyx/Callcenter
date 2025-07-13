import { NextResponse } from "next/server";
import { type AgentStatusData } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "Datas-json", "agent-status-data.json");

async function readData(): Promise<AgentStatusData[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
       // If the file doesn't exist, create the directory and the file.
      try {
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(dataFilePath, "[]", "utf8");
      } catch (mkdirError) {
        console.error("Error creating data file directory:", mkdirError);
      }
      return [];
    }
    console.error("Error reading agent status data file:", error);
    return [];
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

import { NextResponse } from "next/server";
import { type CallData } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "Datas-json");
const dataFilePath = path.join(dataDir, "call-data.json");

async function ensureDirectoryExists() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

async function readData(): Promise<CallData[]> {
  try {
    await ensureDirectoryExists();
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, "[]", "utf8");
      return [];
    }
    console.error("Error reading data file:", error);
    return [];
  }
}

async function writeData(data: CallData[]): Promise<void> {
  await ensureDirectoryExists();
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const newData: CallData | CallData[] = await request.json();
    console.log("Données reçues du PBX via /api/stream:", newData);

    const allData = await readData();

    const dataToProcess = Array.isArray(newData) ? newData : [newData];

    dataToProcess.forEach(call => {
      if (call.parent_call_id) {
        const parentCall = allData.find(c => c.call_id === call.parent_call_id) || dataToProcess.find(c => c.call_id === call.parent_call_id);
        if (parentCall && parentCall.parent_call_id) {
          call.parent_call_id = parentCall.parent_call_id;
        }
      }
    });

    allData.push(...dataToProcess);

    await writeData(allData);

    return NextResponse.json(
      { message: "Données reçues et traitées avec succès.", data: allData },
      { status: 200 }
    );
  } catch (error)
  {
    console.error("Erreur lors du traitement du flux de données entrant:", error);
    return NextResponse.json(
      { message: "Format JSON invalide" },
      { status: 400 }
    );
  }
}


import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { type QueueIvrData } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "queue-ivr-data.json");

async function readData(): Promise<QueueIvrData[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    console.error("Error reading queue/IVR data file:", error);
    return [];
  }
}

async function writeData(data: QueueIvrData[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const newData: QueueIvrData | QueueIvrData[] = await request.json();
    console.log("Données de file d'attente/IVR reçues via /api/stream/queue-ivr:", newData);

    const allData = await readData();
    const dataToProcess = Array.isArray(newData) ? newData : [newData];
    
    allData.push(...dataToProcess);

    await writeData(allData);

    return NextResponse.json(
      { message: "Données de file d'attente/IVR reçues et traitées avec succès.", data: allData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement du flux de données de file d'attente/IVR:", error);
    return NextResponse.json(
      { message: "Format JSON invalide" },
      { status: 400 }
    );
  }
}


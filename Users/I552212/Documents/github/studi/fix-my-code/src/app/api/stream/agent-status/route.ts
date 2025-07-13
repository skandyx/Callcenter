
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "Datas-json");
const dataFilePath = path.join(dataDir, "agent-status-data.json");

async function readData(): Promise<any[]> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, "[]", "utf8");
      return []; 
    }
    console.error("Error reading agent status data file:", error);
    return [];
  }
}

async function writeData(data: any[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    console.log("Données de disponibilité des agents reçues via /api/stream/agent-status:", newData);

    const allData = await readData();

    if (Array.isArray(newData)) {
      allData.push(...newData);
    } else {
      allData.push(newData);
    }

    await writeData(allData);

    return NextResponse.json(
      { message: "Données de disponibilité des agents reçues et traitées avec succès.", data: allData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement du flux de disponibilité des agents:", error);
    return NextResponse.json(
      { message: "Format JSON invalide" },
      { status: 400 }
    );
  }
}

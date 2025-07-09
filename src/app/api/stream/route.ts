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
      // File doesn't exist, return empty array
      return [];
    }
    // For other errors, re-throw
    throw error;
  }
}

async function writeData(data: CallData[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const newData: CallData = await request.json();

    // Read existing data
    const allData = await readData();

    // Add the received data to our store
    allData.push(newData);

    // Write updated data back to the file
    await writeData(allData);


    console.log("Données reçues du PBX via /api/stream:", newData);

    return NextResponse.json(
      { message: "Données reçues et traitées avec succès." },
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
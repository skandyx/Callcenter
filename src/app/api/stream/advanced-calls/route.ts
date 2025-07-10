import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { type AdvancedCallData } from "@/lib/types";

// Define the path to the data file for advanced call data
const dataFilePath = path.join(process.cwd(), "advanced-call-data.json");

async function readData(): Promise<AdvancedCallData[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    console.error("Error reading advanced data file:", error);
    return [];
  }
}

async function writeData(data: AdvancedCallData[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const newData: AdvancedCallData | AdvancedCallData[] = await request.json();
    console.log("Données d'appel avancées reçues via /api/stream/advanced-calls:", newData);

    const allData = await readData();
    const dataToProcess = Array.isArray(newData) ? newData : [newData];
    
    // Logic to propagate parent_call_id for transfers
    dataToProcess.forEach(call => {
      if (call.parent_call_id) {
        const parentCall = allData.find(c => c.call_id === call.parent_call_id) || dataToProcess.find(c => c.call_id === call.parent_call_id);
         // If the direct parent has a parent, use the original parent_call_id
        if (parentCall && parentCall.parent_call_id) {
          call.parent_call_id = parentCall.parent_call_id;
        }
      }
    });

    allData.push(...dataToProcess);

    await writeData(allData);

    return NextResponse.json(
      { message: "Données avancées reçues et traitées avec succès.", data: allData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement du flux de données avancé:", error);
    return NextResponse.json(
      { message: "Format JSON invalide" },
      { status: 400 }
    );
  }
}

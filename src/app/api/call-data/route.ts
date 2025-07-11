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

async function writeData(data: CallData[]): Promise<void> {
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

    // Read existing data
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

    // Add the received data to our store
    allData.push(...dataToProcess);

    // Write updated data back to the file
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

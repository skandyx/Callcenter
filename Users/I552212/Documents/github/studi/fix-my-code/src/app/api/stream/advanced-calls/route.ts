
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { type AdvancedCallData } from "@/lib/types";

const dataDir = path.join(process.cwd(), "Datas-json");
const advancedDataFilePath = path.join(dataDir, "advanced-call-data.json");

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const fileContent = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, "[]", "utf8");
      return []; 
    }
    console.error(`Error reading data file at ${filePath}:`, error);
    return [];
  }
}

async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const newData: AdvancedCallData | AdvancedCallData[] = await request.json();
    console.log("Données d'appel avancées reçues via /api/stream/advanced-calls:", newData);

    const allAdvancedData = await readData<AdvancedCallData>(advancedDataFilePath);
    
    const dataToProcess = Array.isArray(newData) ? newData : [newData];
    
    dataToProcess.forEach(call => {
      if (call.parent_call_id) {
        const parentCall = allAdvancedData.find(c => c.call_id === call.parent_call_id) || dataToProcess.find(c => c.call_id === call.parent_call_id);
        if (parentCall && parentCall.parent_call_id) {
          call.parent_call_id = parentCall.parent_call_id;
        }
      }
    });

    allAdvancedData.push(...dataToProcess);
       
    await writeData(advancedDataFilePath, allAdvancedData);
   
    return NextResponse.json(
      { message: "Données avancées reçues et traitées avec succès." },
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

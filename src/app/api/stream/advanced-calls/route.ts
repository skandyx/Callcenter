
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { type AdvancedCallData, type QueueIvrData } from "@/lib/types";

// Define the path to the data file for advanced call data
const advancedDataFilePath = path.join(process.cwd(), "advanced-call-data.json");
const queueIvrDataFilePath = path.join(process.cwd(), "queue-ivr-data.json");


// ============== Helper Functions for Reading/Writing Data ==============

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    console.error(`Error reading data file at ${filePath}:`, error);
    return [];
  }
}

async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}


// ============== IVR Data Transformation Logic ==============

function mapStatusToIvrEvent(call: AdvancedCallData): QueueIvrData['event_type'] | null {
    const detail = call.status_detail.toLowerCase();
    if (detail.includes('hangup')) return 'Hangup';
    if (detail.includes('timeout')) return 'Timeout';
    if (detail.includes('digit press')) return 'KeyPress';
    if (detail.includes('redirect')) return 'ExitIVR';
    return null; // Not a mappable IVR event
}

function transformToIvrData(call: AdvancedCallData): QueueIvrData | null {
    const event_type = mapStatusToIvrEvent(call);
    if (!event_type) return null;

    let event_detail = call.status_detail;
    if (event_type === 'ExitIVR' && call.calling_forward) {
        event_detail = `Redirected to ${call.calling_forward}`;
    }

    return {
        datetime: call.enter_datetime,
        call_id: call.call_id,
        queue_name: call.queue_name,
        calling_number: call.calling_number,
        ivr_path: call.queue_name || 'Main IVR', // Use queue_name as a simple path
        event_type,
        event_detail,
    };
}


// ============== API POST Handler ==============

export async function POST(request: Request) {
  try {
    const newData: AdvancedCallData | AdvancedCallData[] = await request.json();
    console.log("Données d'appel avancées reçues via /api/stream/advanced-calls:", newData);

    const allAdvancedData = await readData<AdvancedCallData>(advancedDataFilePath);
    const allQueueIvrData = await readData<QueueIvrData>(queueIvrDataFilePath);
    
    const dataToProcess = Array.isArray(newData) ? newData : [newData];
    const newIvrEvents: QueueIvrData[] = [];
    
    // Process each incoming call record
    dataToProcess.forEach(call => {
      // Logic to propagate parent_call_id for transfers
      if (call.parent_call_id) {
        const parentCall = allAdvancedData.find(c => c.call_id === call.parent_call_id) || dataToProcess.find(c => c.call_id === call.parent_call_id);
        if (parentCall && parentCall.parent_call_id) {
          call.parent_call_id = parentCall.parent_call_id;
        }
      }

      // Check if the call is an IVR event and transform it
      if (call.status === 'IVR') {
          const ivrEvent = transformToIvrData(call);
          if (ivrEvent) {
              newIvrEvents.push(ivrEvent);
          }
      }
    });

    // Add new data to existing data
    allAdvancedData.push(...dataToProcess);
    allQueueIvrData.push(...newIvrEvents);

    // Write updated data back to files
    await writeData(advancedDataFilePath, allAdvancedData);
    if (newIvrEvents.length > 0) {
        await writeData(queueIvrDataFilePath, allQueueIvrData);
    }

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

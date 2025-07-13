
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { type AdvancedCallData, type QueueIvrData } from "@/lib/types";

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


// ============== IVR Event Mapping Logic ==============

function mapToIvrEvent(call: AdvancedCallData): Omit<QueueIvrData, "ivr_path" | "duration"> | null {
    const detail = call.status_detail.toLowerCase();

    let event_type: QueueIvrData['event_type'] | null = null;
    let event_detail = call.status_detail;

    if (call.status === 'IVR') {
        if (detail.includes('hangup by timeout')) {
            event_type = 'Timeout';
            event_detail = 'IVR hangup by timeout';
        } else if (detail.includes('redirect by digit press')) {
            event_type = 'KeyPress';
            event_detail = `Pressed digit for redirect to ${call.calling_forward}`;
        } else if (detail.includes('direct redirect')) {
            event_type = 'ExitIVR';
            event_detail = `Direct redirect to ${call.calling_forward}`;
        }
    } else if (call.status === 'Completed' && call.time_in_queue_seconds !== undefined) {
         event_type = 'ExitIVR';
         // The final agent name will be pulled from CallData on the frontend.
         event_detail = `Connected to agent`;
    }

    if (event_type) {
        return {
            datetime: call.enter_datetime,
            call_id: call.parent_call_id || call.call_id, // Use parent_call_id to group IVR events
            queue_name: call.queue_name,
            calling_number: call.calling_number,
            event_type: event_type,
            event_detail: event_detail,
        };
    }
    
    return null;
}


function assignIvrPathAndDuration(events: (Omit<QueueIvrData, "ivr_path" | "duration">)[]): QueueIvrData[] {
  const groupedByCall = new Map<string, (Omit<QueueIvrData, "ivr_path" | "duration">)[]>();

  // Group events by call_id
  for (const event of events) {
    if (!groupedByCall.has(event.call_id)) {
      groupedByCall.set(event.call_id, []);
    }
    groupedByCall.get(event.call_id)!.push(event);
  }

  const result: QueueIvrData[] = [];

  // Process each group
  for (const group of groupedByCall.values()) {
    // Sort events within the group chronologically
    const sortedGroup = group.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    
    let currentPath = 'Entry';
    
    for (let i = 0; i < sortedGroup.length; i++) {
      const event = sortedGroup[i];
      
      // Calculate duration: time until the next event
      const duration = (i < sortedGroup.length - 1)
        ? (new Date(sortedGroup[i + 1].datetime).getTime() - new Date(event.datetime).getTime()) / 1000
        : undefined; // No duration for the last event

      // Assign the path as it was *before* this event
      const eventWithPath = { ...event, ivr_path: currentPath, duration };
      result.push(eventWithPath);

      // Update the path for the *next* event
      if (event.event_type === 'ExitIVR' && event.queue_name) {
         if (!currentPath.endsWith(event.queue_name)) {
           currentPath = `${currentPath} -> ${event.queue_name}`;
         }
      } else if (event.event_type === 'KeyPress') {
          if (!currentPath.endsWith('Keypress')) {
              currentPath = `${currentPath} -> Keypress`;
          }
      } else if (event.queue_name && !currentPath.endsWith(event.queue_name)) {
          currentPath = `${currentPath} -> ${event.queue_name}`;
      }
    }
  }

  return result;
}


// ============== API POST Handler ==============

export async function POST(request: Request) {
  try {
    const newData: AdvancedCallData | AdvancedCallData[] = await request.json();
    console.log("Données d'appel avancées reçues via /api/stream/advanced-calls:", newData);

    const allAdvancedData = await readData<AdvancedCallData>(advancedDataFilePath);
    let allQueueIvrData = await readData<Omit<QueueIvrData, "ivr_path" | "duration">>(queueIvrDataFilePath);
    
    const dataToProcess = Array.isArray(newData) ? newData : [newData];
    
    // Process each incoming call record
    dataToProcess.forEach(call => {
      // Logic to propagate parent_call_id for transfers
      if (call.parent_call_id) {
        const parentCall = allAdvancedData.find(c => c.call_id === call.parent_call_id) || dataToProcess.find(c => c.call_id === call.parent_call_id);
        if (parentCall && parentCall.parent_call_id) {
          call.parent_call_id = parentCall.parent_call_id;
        }
      }

      // Logic to map to IVR event
      const ivrEvent = mapToIvrEvent(call);
      if (ivrEvent) {
          // Prevent duplicates
          const existingEventIndex = allQueueIvrData.findIndex(e => e.datetime === ivrEvent.datetime && e.call_id === ivrEvent.call_id);
          if (existingEventIndex === -1) {
              allQueueIvrData.push(ivrEvent);
          }
      }
    });

    // Add new data to existing data
    allAdvancedData.push(...dataToProcess);
    
    // Always re-calculate paths and durations for the entire dataset to ensure correctness
    if(allQueueIvrData.length > 0) {
      const processedIvrData = assignIvrPathAndDuration(allQueueIvrData);
      await writeData(queueIvrDataFilePath, processedIvrData);
    }
   
    // Write updated data back to files
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

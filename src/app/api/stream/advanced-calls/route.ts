
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

function mapToIvrEvent(call: AdvancedCallData): Omit<QueueIvrData, "ivr_path"> | null {
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
         event_detail = `Connected to agent ${call.agent}`;
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


function assignIvrPath(events: QueueIvrData[]): QueueIvrData[] {
  const pathMap = new Map<string, string>();
  const sortedEvents = events.sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  
  return sortedEvents.map(event => {
    // Get the path as it was *before* this event.
    const previousPath = pathMap.get(event.call_id) || 'Entry';
    
    let nextPath = previousPath;

    if (event.event_type === 'ExitIVR' && event.queue_name) {
       // When exiting to an agent/queue, add that queue to the path
       if (!nextPath.endsWith(event.queue_name)) {
         nextPath = `${nextPath} -> ${event.queue_name}`;
       }
    } else if (event.event_type === 'KeyPress') {
        // Only add "Keypress" if it's not already the last step
        if (!nextPath.endsWith('Keypress')) {
            nextPath = `${nextPath} -> Keypress`;
        }
    } else if (event.queue_name && !nextPath.endsWith(event.queue_name)) {
        // For other events, if a queue is involved, add it.
        nextPath = `${nextPath} -> ${event.queue_name}`;
    }
    
    // Update the map for the *next* event to use.
    pathMap.set(event.call_id, nextPath);

    // Assign the path as it was *before* this event happened.
    return {
      ...event,
      ivr_path: previousPath
    };
  });
}


// ============== API POST Handler ==============

export async function POST(request: Request) {
  try {
    const newData: AdvancedCallData | AdvancedCallData[] = await request.json();
    console.log("Données d'appel avancées reçues via /api/stream/advanced-calls:", newData);

    const allAdvancedData = await readData<AdvancedCallData>(advancedDataFilePath);
    const allQueueIvrData = await readData<QueueIvrData>(queueIvrDataFilePath);
    
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
          const existingEventIndex = allQueueIvrData.findIndex(e => e.datetime === ivrEvent.datetime && e.call_id === ivrEvent.call_id);
          if (existingEventIndex === -1) {
              allQueueIvrData.push({ ...ivrEvent, ivr_path: '' }); // Add with temporary empty path
          }
      }
    });

    // Add new data to existing data
    allAdvancedData.push(...dataToProcess);
    
    if(allQueueIvrData.length > 0) {
      const processedIvrData = assignIvrPath(allQueueIvrData);
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

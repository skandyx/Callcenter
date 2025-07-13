
import { NextResponse } from "next/server";
import { type AdvancedCallData, type QueueIvrData } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

const advancedDataFilePath = path.join(process.cwd(), "Datas-json", "advanced-call-data.json");

// ============== Helper Functions for Reading Data ==============

async function readAdvancedData(): Promise<AdvancedCallData[]> {
  try {
    const fileContent = await fs.readFile(advancedDataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
       // If the file doesn't exist, create the directory and the file.
      try {
        await fs.mkdir(path.dirname(advancedDataFilePath), { recursive: true });
        await fs.writeFile(advancedDataFilePath, "[]", "utf8");
      } catch (mkdirError) {
        console.error("Error creating data file directory:", mkdirError);
      }
      return [];
    }
    console.error("Error reading advanced call data file:", error);
    return [];
  }
}


// ============== On-the-fly IVR Event Transformation Logic ==============

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
         event_detail = `Connected to agent`;
    }

    if (event_type) {
        return {
            datetime: call.enter_datetime,
            call_id: call.parent_call_id || call.call_id,
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

  for (const event of events) {
    if (!groupedByCall.has(event.call_id)) {
      groupedByCall.set(event.call_id, []);
    }
    groupedByCall.get(event.call_id)!.push(event);
  }

  const result: QueueIvrData[] = [];

  for (const group of groupedByCall.values()) {
    const sortedGroup = group.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    
    let currentPath = 'Entry';
    
    for (let i = 0; i < sortedGroup.length; i++) {
      const event = sortedGroup[i];
      
      const duration = (i < sortedGroup.length - 1)
        ? (new Date(sortedGroup[i + 1].datetime).getTime() - new Date(event.datetime).getTime()) / 1000
        : undefined;

      const eventWithPath = { ...event, ivr_path: currentPath, duration };
      result.push(eventWithPath);

      let pathComponent = event.queue_name;
      if (event.event_type === 'KeyPress') {
          pathComponent = 'Keypress';
      } else if (event.event_type === 'ExitIVR' && event.event_detail.toLowerCase().includes('connected to agent')) {
          pathComponent = event.queue_name;
      }


      if (pathComponent && !currentPath.endsWith(pathComponent)) {
          currentPath = `${currentPath} -> ${pathComponent}`;
      }
    }
  }

  return result;
}


// ============== API GET Handler ==============

export async function GET() {
  const advancedData = await readAdvancedData();
  const ivrEvents: (Omit<QueueIvrData, "ivr_path" | "duration">)[] = [];

  for (const call of advancedData) {
      const ivrEvent = mapToIvrEvent(call);
      if (ivrEvent) {
          ivrEvents.push(ivrEvent);
      }
  }

  const processedIvrData = assignIvrPathAndDuration(ivrEvents);
  
  return NextResponse.json(processedIvrData);
}

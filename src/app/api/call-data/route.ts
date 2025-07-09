import { NextResponse } from "next/server";
import { mockCallData } from "@/lib/mock-data";

function* chunkArray<T>(arr: T[], size: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

async function* streamData() {
  const encoder = new TextEncoder();
  const dataChunks = chunkArray(mockCallData, 10);

  for (const chunk of dataChunks) {
    const jsonString = JSON.stringify(chunk);
    yield encoder.encode(jsonString + "\n");
    await new Promise((resolve) => setTimeout(resolve, 200)); // Simuler un délai réseau
  }
}

export async function GET() {
  const dataStream = streamData();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of dataStream) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

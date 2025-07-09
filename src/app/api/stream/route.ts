import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // In a real application, you would validate the data against a schema
    // and then store it in a database or push it to a real-time service.
    // For this example, we just log it to the console to show it was received.
    console.log("Received data stream:", data);

    return NextResponse.json(
      { message: "Data received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing stream data:", error);
    return NextResponse.json(
      { message: "Invalid JSON format" },
      { status: 400 }
    );
  }
}

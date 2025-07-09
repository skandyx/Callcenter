import { NextResponse } from "next/server";
import { callDataStore } from "@/lib/call-data-store";
import { type CallData } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const data: CallData = await request.json();

    // Add the received data to our in-memory store.
    // In a real app, you'd push this to a database or a real-time service.
    callDataStore.push(data);

    console.log("Données reçues du PBX et ajoutées au store:", data);

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

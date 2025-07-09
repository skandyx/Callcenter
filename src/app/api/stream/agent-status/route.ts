import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Dans une application réelle, vous valideriez les données et les traiteriez.
    // Pour cet exemple, nous affichons simplement les données reçues.
    console.log("Données de disponibilité des agents reçues via /api/stream/agent-status:", data);

    return NextResponse.json(
      { message: "Données de disponibilité des agents reçues avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement du flux de disponibilité des agents:", error);
    return NextResponse.json(
      { message: "Format JSON invalide" },
      { status: 400 }
    );
  }
}

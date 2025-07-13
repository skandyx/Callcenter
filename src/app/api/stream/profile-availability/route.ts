import { NextResponse } from "next/server";

// This endpoint is a placeholder. It currently logs received data.
// In a real application, you would add logic to process and store this data.
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // In a real application, you would validate the data and process it.
    // For this example, we just log the received data.
    console.log("Données de disponibilité des profils reçues via /api/stream/profile-availability:", data);

    return NextResponse.json(
      { message: "Données de disponibilité des profils reçues avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement du flux de disponibilité des profils:", error);
    return NextResponse.json(
      { message: "Format JSON invalide" },
      { status: 400 }
    );
  }
}

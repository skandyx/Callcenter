import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Dans une application réelle, vous valideriez les données et les traiteriez.
    // Pour cet exemple, nous affichons simplement les données reçues.
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

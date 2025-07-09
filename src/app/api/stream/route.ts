import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Dans une application réelle, vous valideriez les données par rapport à un schéma
    // et les stockeriez dans une base de données ou les pousseriez vers un service en temps réel.
    // Pour cet exemple, nous affichons simplement les données reçues dans la console du serveur.
    console.log("Données reçues du PBX via /api/stream:", data);

    return NextResponse.json(
      { message: "Données reçues avec succès par l'application." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement du flux de données entrant:", error);
    return NextResponse.json(
      { message: "Format JSON invalide" },
      { status: 400 }
    );
  }
}

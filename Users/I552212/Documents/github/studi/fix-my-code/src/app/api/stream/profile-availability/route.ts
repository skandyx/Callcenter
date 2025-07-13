import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { type ProfileAvailabilityData } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "profile-availability-data.json");

async function readData(): Promise<ProfileAvailabilityData[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    console.error("Error reading profile availability data file:", error);
    return [];
  }
}

async function writeData(data: ProfileAvailabilityData[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const newData: ProfileAvailabilityData | ProfileAvailabilityData[] = await request.json();
    console.log("Données de disponibilité des profils reçues via /api/stream/profile-availability:", newData);

    const allData = await readData();

    if (Array.isArray(newData)) {
      allData.push(...newData);
    } else {
      allData.push(newData);
    }

    await writeData(allData);

    return NextResponse.json(
      { message: "Données de disponibilité des profils reçues et traitées avec succès." },
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

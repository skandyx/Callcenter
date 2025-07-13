
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "Datas-json");
const simplifiedDataPath = path.join(dataDir, "call-data.json");
const advancedDataPath = path.join(dataDir, "advanced-call-data.json");
const agentStatusDataPath = path.join(dataDir, "agent-status-data.json");
const profileAvailabilityDataPath = path.join(dataDir, "profile-availability-data.json");


async function clearFile(filePath: string): Promise<void> {
    try {
        // Ensure the directory exists before trying to access the file
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        // Write an empty array to the file, creating it if it doesn't exist.
        await fs.writeFile(filePath, "[]", "utf8");
    } catch (error: any) {
        // This will catch more critical errors during file writing
        console.error(`Error clearing or creating file: ${filePath}`, error);
        throw error;
    }
}

export async function POST() {
    try {
        // The clearFile function now handles directory creation.
        await clearFile(simplifiedDataPath);
        await clearFile(advancedDataPath);
        await clearFile(agentStatusDataPath);
        await clearFile(profileAvailabilityDataPath);

        return NextResponse.json(
            { message: "Toutes les données d'appel ont été effacées avec succès." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur lors de la suppression des données:", error);
        return NextResponse.json(
            { message: "Erreur du serveur lors de la suppression des données." },
            { status: 500 }
        );
    }
}

    
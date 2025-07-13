
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
        await fs.access(filePath);
        await fs.writeFile(filePath, "[]", "utf8");
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log(`File not found, no need to clear: ${filePath}`);
            // Attempt to create the directory if it doesn't exist
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, "[]", "utf8");
            console.log(`Created new empty file: ${filePath}`);
        } else {
            throw error;
        }
    }
}

export async function POST() {
    try {
        await fs.mkdir(dataDir, { recursive: true });
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

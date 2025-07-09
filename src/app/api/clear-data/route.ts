import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const simplifiedDataPath = path.join(process.cwd(), "call-data.json");
const advancedDataPath = path.join(process.cwd(), "advanced-call-data.json");

async function clearFile(filePath: string): Promise<void> {
    try {
        // Check if file exists before trying to write to it
        await fs.access(filePath);
        await fs.writeFile(filePath, "[]", "utf8");
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, which is fine. Nothing to clear.
            console.log(`File not found, no need to clear: ${filePath}`);
        } else {
            // For other errors, re-throw them
            throw error;
        }
    }
}

export async function POST() {
    try {
        await clearFile(simplifiedDataPath);
        await clearFile(advancedDataPath);

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

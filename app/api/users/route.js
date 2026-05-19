import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const rows = await query(
            `
			SELECT
				id,
				nom,
				email,
				date_creation
			FROM utilisateurs
			ORDER BY date_creation DESC, id DESC
			`
        );

        return NextResponse.json(
            {
                success: true,
                data: rows,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de la recuperation des utilisateurs.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

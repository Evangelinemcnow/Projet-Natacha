import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request) {
    try {
        const authUser = getAuthenticatedUser(request);

        if (!authUser?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentification requise.",
                },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fichier image manquant.",
                },
                { status: 400 }
            );
        }

        const uploaded = await uploadImage(file);

        return NextResponse.json(
            {
                success: true,
                message: "Image envoyee avec succes.",
                data: uploaded,
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de l'upload.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
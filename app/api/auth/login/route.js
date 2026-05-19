import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { findUserByEmail } from "@/lib/services/user.service";
import { validateLoginInput } from "@/lib/validators";

export async function POST(request) {
    try {
        const body = await request.json();
        const { valid, errors, data } = validateLoginInput(body);

        if (!valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Donnees invalides",
                    errors,
                },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(data.email);

        if (!user?.password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email ou mot de passe incorrect.",
                },
                { status: 401 }
            );
        }

        const passwordMatches = await bcrypt.compare(data.password, user.password);

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email ou mot de passe incorrect.",
                },
                { status: 401 }
            );
        }

        const token = signAuthToken({
            sub: user.id,
            email: user.email,
            name: user.name,
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "Connexion reussie.",
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        createdAt: user.createdAt,
                    },
                    token,
                },
            },
            { status: 200 }
        );

        setAuthCookie(response, token);
        return response;
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur pendant la connexion.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

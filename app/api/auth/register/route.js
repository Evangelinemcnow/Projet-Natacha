import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/services/user.service";
import { validateRegisterInput } from "@/lib/validators";

export async function POST(request) {
    try {
        const body = await request.json();
        const { valid, errors, data } = validateRegisterInput(body);

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

        const existingUser = await findUserByEmail(data.email);

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Un compte existe deja avec cet email.",
                },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(data.password, 12);
        const createdUser = await createUser({
            name: data.name,
            email: data.email,
            passwordHash,
        });

        const token = signAuthToken({
            sub: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "Inscription reussie.",
                data: {
                    user: createdUser,
                    token,
                },
            },
            { status: 201 }
        );

        setAuthCookie(response, token);
        return response;
    } catch (error) {
        if (error?.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Un compte existe deja avec cet email.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur pendant l'inscription.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { sendNewMessageNotification } from "@/lib/mail";

function toPositiveInt(value) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

export async function GET(request) {
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

        const rows = await query(
            `
			SELECT
				m.id,
				m.contenu,
				m.date_envoi,
				m.expediteur_id,
				m.destinataire_id,
				m.annonce_id,
				e.nom AS expediteur_nom,
				d.nom AS destinataire_nom,
				a.titre AS annonce_titre
			FROM messages m
			INNER JOIN utilisateurs e ON e.id = m.expediteur_id
			INNER JOIN utilisateurs d ON d.id = m.destinataire_id
			LEFT JOIN annonces a ON a.id = m.annonce_id
			WHERE m.expediteur_id = ? OR m.destinataire_id = ?
			ORDER BY m.date_envoi DESC, m.id DESC
			`,
            [authUser.id, authUser.id]
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
                message: "Erreur serveur lors de la recuperation des messages.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

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

        const body = await request.json();
        const contenu = typeof body?.contenu === "string" ? body.contenu.trim() : "";
        const destinataireId = toPositiveInt(body?.destinataireId);
        const annonceId = toPositiveInt(body?.annonceId);

        if (!contenu || !destinataireId || !annonceId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Donnees invalides pour envoyer le message.",
                },
                { status: 400 }
            );
        }

        if (destinataireId === Number(authUser.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vous ne pouvez pas vous envoyer un message a vous-meme.",
                },
                { status: 400 }
            );
        }

        const adRows = await query(
            `
			SELECT
				a.id,
				a.titre,
				a.utilisateur_id,
				u.email AS vendeur_email,
				u.nom AS vendeur_nom
			FROM annonces a
			INNER JOIN utilisateurs u ON u.id = a.utilisateur_id
			WHERE a.id = ?
			LIMIT 1
			`,
            [annonceId]
        );

        const ad = adRows[0];

        if (!ad) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Annonce introuvable.",
                },
                { status: 404 }
            );
        }

        if (Number(destinataireId) !== Number(ad.utilisateur_id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le destinataire doit etre le vendeur de l'annonce.",
                },
                { status: 400 }
            );
        }

        const result = await query(
            `
			INSERT INTO messages (contenu, date_envoi, expediteur_id, destinataire_id, annonce_id)
			VALUES (?, NOW(), ?, ?, ?)
			`,
            [contenu, authUser.id, destinataireId, annonceId]
        );

        const rows = await query(
            `
			SELECT id, contenu, date_envoi, expediteur_id, destinataire_id, annonce_id
			FROM messages
			WHERE id = ?
			LIMIT 1
			`,
            [result.insertId]
        );

        const adUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/ads/${annonceId}`;
        await sendNewMessageNotification({
            toEmail: ad.vendeur_email,
            fromName: authUser.name,
            adTitle: ad.titre,
            messageText: contenu,
            adUrl,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Message envoye avec succes.",
                data: rows[0],
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de l'envoi du message.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

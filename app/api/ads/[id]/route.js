import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { saveAdImages } from "@/lib/services/ad.service";

function toPositiveInt(value) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

function toImageUrls(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    const uniqueUrls = [];
    const seen = new Set();

    for (const item of value) {
        if (typeof item !== "string") {
            continue;
        }

        const url = item.trim();

        if (!url || seen.has(url)) {
            continue;
        }

        if (!(url.startsWith("/") || /^https?:\/\//i.test(url))) {
            continue;
        }

        seen.add(url);
        uniqueUrls.push(url);
    }

    return uniqueUrls.slice(0, 6);
}

export async function GET(_request, { params }) {
    try {
        const resolvedParams = await params;
        const adId = toPositiveInt(resolvedParams?.id);

        if (!adId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Identifiant annonce invalide.",
                },
                { status: 400 }
            );
        }

        const rows = await query(
            `
			SELECT
				a.id,
				a.titre,
				a.description,
				a.prix,
				a.localisation,
				a.date_publication,
				a.utilisateur_id,
				a.categorie_id,
				u.nom AS vendeur_nom,
				u.email AS vendeur_email,
				c.nom AS categorie_nom
			FROM annonces a
			INNER JOIN utilisateurs u ON u.id = a.utilisateur_id
			LEFT JOIN categories c ON c.id = a.categorie_id
			WHERE a.id = ?
			LIMIT 1
			`,
            [adId]
        );

        if (!rows[0]) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Annonce introuvable.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: rows[0],
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de la recuperation de l'annonce.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
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

        const resolvedParams = await params;
        const adId = toPositiveInt(resolvedParams?.id);

        if (!adId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Identifiant annonce invalide.",
                },
                { status: 400 }
            );
        }

        const existingRows = await query(
            `
			SELECT id, utilisateur_id
			FROM annonces
			WHERE id = ?
			LIMIT 1
			`,
            [adId]
        );

        const existingAd = existingRows[0];

        if (!existingAd) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Annonce introuvable.",
                },
                { status: 404 }
            );
        }

        if (Number(existingAd.utilisateur_id) !== Number(authUser.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vous ne pouvez modifier que vos propres annonces.",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const titre = typeof body?.titre === "string" ? body.titre.trim() : "";
        const description = typeof body?.description === "string" ? body.description.trim() : "";
        const localisation = typeof body?.localisation === "string" ? body.localisation.trim() : "";
        const prix = Number(body?.prix);
        const categorieId = Number(body?.categorieId);
        const imageUrls = toImageUrls(body?.imageUrls);

        if (!titre || !description || !localisation || !Number.isFinite(prix) || !Number.isInteger(categorieId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Donnees invalides pour la mise a jour de l'annonce.",
                },
                { status: 400 }
            );
        }

        await query(
            `
			UPDATE annonces
			SET titre = ?, description = ?, prix = ?, localisation = ?, categorie_id = ?
			WHERE id = ?
			`,
            [titre, description, prix, localisation, categorieId, adId]
        );

        await saveAdImages(adId, imageUrls);

        const rows = await query(
            `
			SELECT
				id,
				titre,
				description,
				prix,
				localisation,
				date_publication,
				utilisateur_id,
				categorie_id
			FROM annonces
			WHERE id = ?
			LIMIT 1
			`,
            [adId]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Annonce mise a jour avec succes.",
                data: rows[0],
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de la mise a jour de l'annonce.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
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

        const resolvedParams = await params;
        const adId = toPositiveInt(resolvedParams?.id);

        if (!adId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Identifiant annonce invalide.",
                },
                { status: 400 }
            );
        }

        const existingRows = await query(
            `
			SELECT id, utilisateur_id
			FROM annonces
			WHERE id = ?
			LIMIT 1
			`,
            [adId]
        );

        const existingAd = existingRows[0];

        if (!existingAd) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Annonce introuvable.",
                },
                { status: 404 }
            );
        }

        if (Number(existingAd.utilisateur_id) !== Number(authUser.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vous ne pouvez supprimer que vos propres annonces.",
                },
                { status: 403 }
            );
        }

        await query("DELETE FROM annonces WHERE id = ?", [adId]);

        return NextResponse.json(
            {
                success: true,
                message: "Annonce supprimee avec succes.",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de la suppression de l'annonce.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

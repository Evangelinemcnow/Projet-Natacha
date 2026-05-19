import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { saveAdImages } from "@/lib/services/ad.service";

function toNumber(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const n = Number(value);
    return Number.isFinite(n) ? n : null;
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

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const keyword = url.searchParams.get("q")?.trim();
        const categoryId = toNumber(url.searchParams.get("categoryId"));
        const minPrice = toNumber(url.searchParams.get("minPrice"));
        const maxPrice = toNumber(url.searchParams.get("maxPrice"));
        const location = url.searchParams.get("location")?.trim();

        const conditions = [];
        const params = [];

        if (keyword) {
            conditions.push("(a.titre LIKE ? OR a.description LIKE ?)");
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (categoryId !== null) {
            conditions.push("a.categorie_id = ?");
            params.push(categoryId);
        }

        if (minPrice !== null) {
            conditions.push("a.prix >= ?");
            params.push(minPrice);
        }

        if (maxPrice !== null) {
            conditions.push("a.prix <= ?");
            params.push(maxPrice);
        }

        if (location) {
            conditions.push("a.localisation LIKE ?");
            params.push(`%${location}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
			${whereClause}
			ORDER BY a.date_publication DESC, a.id DESC
			`,
            params
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
                message: "Erreur serveur lors de la recuperation des annonces.",
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
        const titre = typeof body?.titre === "string" ? body.titre.trim() : "";
        const description = typeof body?.description === "string" ? body.description.trim() : "";
        const localisation = typeof body?.localisation === "string" ? body.localisation.trim() : "";
        const prix = toNumber(body?.prix);
        const categorieId = toNumber(body?.categorieId);
        const imageUrls = toImageUrls(body?.imageUrls);

        if (!titre || !description || !localisation || prix === null || categorieId === null) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Donnees invalides pour creer l'annonce.",
                },
                { status: 400 }
            );
        }

        const result = await query(
            `
			INSERT INTO annonces
				(titre, description, prix, localisation, date_publication, utilisateur_id, categorie_id)
			VALUES
				(?, ?, ?, ?, NOW(), ?, ?)
			`,
            [titre, description, prix, localisation, authUser.id, categorieId]
        );

        await saveAdImages(result.insertId, imageUrls);

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
            [result.insertId]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Annonce creee avec succes.",
                data: rows[0],
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de la creation de l'annonce.",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

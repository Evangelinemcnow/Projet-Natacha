import { query } from "@/lib/db";

const IMAGE_TABLE_CANDIDATES = ["images", "annonce_images", "ad_images"];
let cachedImageConfig;

function toNumberOrNull(value) {
	if (value === null || value === undefined || value === "") {
		return null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function pickFirst(columns, candidates) {
	return candidates.find((candidate) => columns.has(candidate)) ?? null;
}

async function getImageTableConfig() {
	if (cachedImageConfig !== undefined) {
		return cachedImageConfig;
	}

	try {
		const tableRows = await query(
			`
			SELECT TABLE_NAME
			FROM INFORMATION_SCHEMA.TABLES
			WHERE TABLE_SCHEMA = DATABASE()
			  AND TABLE_NAME IN (?, ?, ?)
			`,
			IMAGE_TABLE_CANDIDATES
		);

		const tableNames = new Set(tableRows.map((row) => row.TABLE_NAME));
		const tableName = IMAGE_TABLE_CANDIDATES.find((name) => tableNames.has(name));

		if (!tableName) {
			cachedImageConfig = null;
			return cachedImageConfig;
		}

		const columnsRows = await query(
			`
			SELECT COLUMN_NAME
			FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
			`,
			[tableName]
		);

		const columns = new Set(columnsRows.map((row) => row.COLUMN_NAME));
		const idColumn = pickFirst(columns, ["id"]);
		const adIdColumn = pickFirst(columns, ["annonce_id", "ad_id"]);
		const urlColumn = pickFirst(columns, ["url", "image_url", "path", "chemin"]);
		const createdAtColumn = pickFirst(columns, ["date_creation", "created_at", "uploaded_at"]);

		if (!idColumn || !adIdColumn || !urlColumn) {
			cachedImageConfig = null;
			return cachedImageConfig;
		}

		cachedImageConfig = {
			tableName,
			idColumn,
			adIdColumn,
			urlColumn,
			createdAtColumn,
		};

		return cachedImageConfig;
	} catch {
		cachedImageConfig = null;
		return cachedImageConfig;
	}
}

async function hydrateImagesForAds(ads = []) {
	if (!Array.isArray(ads) || ads.length === 0) {
		return ads;
	}

	const config = await getImageTableConfig();

	if (!config) {
		return ads.map((ad) => ({
			...ad,
			images: [],
			imagePrincipale: null,
		}));
	}

	const adIds = ads.map((ad) => Number(ad.id)).filter((id) => Number.isInteger(id) && id > 0);

	if (adIds.length === 0) {
		return ads;
	}

	const placeholders = adIds.map(() => "?").join(", ");
	const imageRows = await query(
		`
		SELECT
			${config.idColumn} AS id,
			${config.adIdColumn} AS annonce_id,
			${config.urlColumn} AS url,
			${config.createdAtColumn ? `${config.createdAtColumn} AS created_at` : "NULL AS created_at"}
		FROM ${config.tableName}
		WHERE ${config.adIdColumn} IN (${placeholders})
		ORDER BY annonce_id ASC, id ASC
		`,
		adIds
	);

	const byAdId = new Map();

	for (const row of imageRows) {
		const rowAdId = Number(row.annonce_id);

		if (!byAdId.has(rowAdId)) {
			byAdId.set(rowAdId, []);
		}

		byAdId.get(rowAdId).push({
			id: row.id,
			url: row.url,
			createdAt: row.created_at,
		});
	}

	return ads.map((ad) => {
		const images = byAdId.get(Number(ad.id)) || [];

		return {
			...ad,
			images,
			imagePrincipale: images[0]?.url || null,
		};
	});
}

function sanitizeImageUrls(imageUrls = []) {
	if (!Array.isArray(imageUrls)) {
		return [];
	}

	const uniqueUrls = [];
	const seen = new Set();

	for (const rawUrl of imageUrls) {
		if (typeof rawUrl !== "string") {
			continue;
		}

		const url = rawUrl.trim();

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

export async function saveAdImages(adId, imageUrls = []) {
	const config = await getImageTableConfig();

	if (!config) {
		return [];
	}

	const safeUrls = sanitizeImageUrls(imageUrls);

	await query(`DELETE FROM ${config.tableName} WHERE ${config.adIdColumn} = ?`, [adId]);

	for (const url of safeUrls) {
		const fields = [config.adIdColumn, config.urlColumn];
		const values = [adId, url];

		if (config.createdAtColumn) {
			fields.push(config.createdAtColumn);
			values.push(new Date());
		}

		const placeholders = fields.map(() => "?").join(", ");

		await query(
			`
			INSERT INTO ${config.tableName} (${fields.join(", ")})
			VALUES (${placeholders})
			`,
			values
		);
	}

	return safeUrls;
}

export async function listAds() {
	const rows = await query(
		`
		SELECT id, titre, description, prix, localisation, date_publication, utilisateur_id, categorie_id
		FROM annonces
		ORDER BY date_publication DESC, id DESC
		`
	);

	return hydrateImagesForAds(rows);
}

export async function searchAds(filters = {}) {
	const keyword = typeof filters.q === "string" ? filters.q.trim() : "";
	const categoryId = toNumberOrNull(filters.categoryId);
	const minPrice = toNumberOrNull(filters.minPrice);
	const maxPrice = toNumberOrNull(filters.maxPrice);
	const location = typeof filters.location === "string" ? filters.location.trim() : "";
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

	return hydrateImagesForAds(rows);
}

export async function listCategories() {
	try {
		return await query(
			`
			SELECT id, nom
			FROM categories
			ORDER BY nom ASC
			`
		);
	} catch {
		return [];
	}
}

export async function listAdsByUser(userId) {
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
			c.nom AS categorie_nom
		FROM annonces a
		LEFT JOIN categories c ON c.id = a.categorie_id
		WHERE a.utilisateur_id = ?
		ORDER BY a.date_publication DESC, a.id DESC
		`,
		[userId]
	);

	return hydrateImagesForAds(rows);
}

export async function getAdById(id) {
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
		[id]
	);

	const hydrated = await hydrateImagesForAds(rows);
	return hydrated[0] ?? null;
}

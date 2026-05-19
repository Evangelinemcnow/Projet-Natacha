import { query } from "@/lib/db";

const USER_TABLE_CANDIDATES = ["utilisateurs", "users"];

function pickFirst(columns, candidates) {
    return candidates.find((candidate) => columns.has(candidate)) ?? null;
}

async function getUserTableConfig() {
    const tableRows = await query(
        `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN (?, ?)
        `,
        USER_TABLE_CANDIDATES
    );

    const tableNames = new Set(tableRows.map((row) => row.TABLE_NAME));
    const tableName = USER_TABLE_CANDIDATES.find((name) => tableNames.has(name));

    if (!tableName) {
        throw new Error(
            "La base doit contenir une table utilisateurs ou users pour gerer l'authentification."
        );
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
    const nameColumn = pickFirst(columns, ["name", "nom", "username"]);
    const emailColumn = pickFirst(columns, ["email"]);
    const passwordColumn = pickFirst(columns, ["password", "mot_de_passe", "password_hash"]);
    const createdAtColumn = pickFirst(columns, ["created_at", "date_creation"]);

    if (!idColumn || !nameColumn || !emailColumn || !passwordColumn) {
        throw new Error(
            "La table utilisateurs/users doit contenir au minimum les colonnes id, name/nom, email et password/mot_de_passe."
        );
    }

    return {
        tableName,
        idColumn,
        nameColumn,
        emailColumn,
        passwordColumn,
        createdAtColumn,
    };
}

function mapUser(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        createdAt: row.createdAt ?? null,
    };
}

export async function findUserByEmail(email) {
    const config = await getUserTableConfig();

    const rows = await query(
        `
		SELECT
			${config.idColumn} AS id,
			${config.nameColumn} AS name,
			${config.emailColumn} AS email,
			${config.passwordColumn} AS password,
			${config.createdAtColumn ? `${config.createdAtColumn} AS createdAt` : "NULL AS createdAt"}
        FROM ${config.tableName}
		WHERE ${config.emailColumn} = ?
		LIMIT 1
		`,
        [email]
    );

    return mapUser(rows[0]);
}

export async function createUser({ name, email, passwordHash }) {
    const config = await getUserTableConfig();

    const fields = [config.nameColumn, config.emailColumn, config.passwordColumn];
    const values = [name, email, passwordHash];

    if (config.createdAtColumn) {
        fields.push(config.createdAtColumn);
        values.push(new Date());
    }

    const placeholders = fields.map(() => "?").join(", ");

    const result = await query(
        `
        INSERT INTO ${config.tableName} (${fields.join(", ")})
		VALUES (${placeholders})
		`,
        values
    );

    const rows = await query(
        `
		SELECT
			${config.idColumn} AS id,
			${config.nameColumn} AS name,
			${config.emailColumn} AS email,
			${config.createdAtColumn ? `${config.createdAtColumn} AS createdAt` : "NULL AS createdAt"}
        FROM ${config.tableName}
		WHERE ${config.idColumn} = ?
		LIMIT 1
		`,
        [result.insertId]
    );

    const user = rows[0];

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt ?? null,
    };
}

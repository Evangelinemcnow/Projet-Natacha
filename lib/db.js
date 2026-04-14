import mysql from "mysql2/promise";

const globalForDb = globalThis;

function getDatabaseUrl() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set in environment variables");
    }

    return databaseUrl;
}

export function getPool() {
    if (!globalForDb.mysqlPool) {
        globalForDb.mysqlPool = mysql.createPool(getDatabaseUrl());
    }

    return globalForDb.mysqlPool;
}

export async function testDatabaseConnection() {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
        await connection.ping();
    } finally {
        connection.release();
    }
}

export async function query(sql, params = []) {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
}

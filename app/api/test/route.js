import { NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/db";

export async function GET() {
    let db = { connected: false };

    try {
        await testDatabaseConnection();
        db = { connected: true };
    } catch (error) {
        db = {
            connected: false,
            error: error instanceof Error ? error.message : "Unknown database error",
        };
    }

    return NextResponse.json(
        {
            success: true,
            message: "API test route is working",
            timestamp: new Date().toISOString(),
            db,
        },
        { status: 200 }
    );
}
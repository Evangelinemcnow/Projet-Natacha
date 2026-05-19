import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "auth_token";

function getJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set in environment variables");
    }

    return jwtSecret;
}

export function signAuthToken(payload) {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: "7d",
    });
}

export function verifyAuthToken(token) {
    try {
        return jwt.verify(token, getJwtSecret());
    } catch {
        return null;
    }
}

export function setAuthCookie(response, token) {
    response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

export function clearAuthCookie(response) {
    response.cookies.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
}

export function getTokenFromRequest(request) {
    const header = request.headers.get("authorization");

    if (header?.startsWith("Bearer ")) {
        return header.slice(7);
    }

    return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function getAuthenticatedUser(request) {
    const token = getTokenFromRequest(request);

    if (!token) {
        return null;
    }

    const payload = verifyAuthToken(token);

    if (!payload || typeof payload !== "object") {
        return null;
    }

    return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
    };
}

export async function getAuthenticatedUserFromCookies() {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    const payload = verifyAuthToken(token);

    if (!payload || typeof payload !== "object") {
        return null;
    }

    return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
    };
}

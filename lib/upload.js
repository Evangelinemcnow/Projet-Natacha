import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeFileName(name) {
    return String(name || "image")
        .replaceAll(/[^a-zA-Z0-9._-]/g, "-")
        .replaceAll(/-+/g, "-")
        .slice(0, 80);
}

function extFromMimeType(mimeType) {
    if (mimeType === "image/jpeg") return ".jpg";
    if (mimeType === "image/png") return ".png";
    if (mimeType === "image/webp") return ".webp";
    if (mimeType === "image/gif") return ".gif";
    return "";
}

export function validateUploadFile(file) {
    if (!file) {
        return { valid: false, message: "Aucun fichier recu." };
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return {
            valid: false,
            message: "Format invalide. Utilisez JPG, PNG, WEBP ou GIF.",
        };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            message: "Image trop volumineuse (5 Mo max).",
        };
    }

    return { valid: true };
}

export async function uploadImage(file) {
    const validation = validateUploadFile(file);

    if (!validation.valid) {
        throw new Error(validation.message);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const extension = extFromMimeType(file.type) || path.extname(file.name || "") || ".bin";
    const safeBaseName = sanitizeFileName(path.basename(file.name || "image", path.extname(file.name || "")));
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeBaseName}${extension}`;
    const absolutePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(absolutePath, buffer);

    return {
        url: `/uploads/${fileName}`,
        size: file.size,
        mimeType: file.type,
    };
}

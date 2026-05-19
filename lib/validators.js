function normalizeString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterInput(payload) {
    const name = normalizeString(payload?.name);
    const email = normalizeString(payload?.email).toLowerCase();
    const password = normalizeString(payload?.password);
    const errors = [];

    if (name.length < 2 || name.length > 80) {
        errors.push("Le nom doit contenir entre 2 et 80 caracteres.");
    }

    if (!isValidEmail(email)) {
        errors.push("L'email est invalide.");
    }

    if (password.length < 8) {
        errors.push("Le mot de passe doit contenir au moins 8 caracteres.");
    }

    if (password.length > 72) {
        errors.push("Le mot de passe ne peut pas depasser 72 caracteres.");
    }

    return {
        valid: errors.length === 0,
        errors,
        data: {
            name,
            email,
            password,
        },
    };
}

export function validateLoginInput(payload) {
    const email = normalizeString(payload?.email).toLowerCase();
    const password = normalizeString(payload?.password);
    const errors = [];

    if (!isValidEmail(email)) {
        errors.push("L'email est invalide.");
    }

    if (!password) {
        errors.push("Le mot de passe est requis.");
    }

    return {
        valid: errors.length === 0,
        errors,
        data: {
            email,
            password,
        },
    };
}

import nodemailer from "nodemailer";

let cachedTransporter = null;

function getMailConfig() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || user;

    if (!host || !user || !pass || !from) {
        return null;
    }

    return {
        host,
        port,
        secure: port === 465,
        user,
        pass,
        from,
    };
}

function getTransporter(config) {
    if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });
    }

    return cachedTransporter;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export async function sendNewMessageNotification(payload) {
    const config = getMailConfig();

    if (!config) {
        return { skipped: true, reason: "mail-not-configured" };
    }

    const transporter = getTransporter(config);
    const to = payload?.toEmail;

    if (!to) {
        return { skipped: true, reason: "missing-recipient" };
    }

    const senderName = escapeHtml(payload?.fromName || "Un utilisateur");
    const adTitle = escapeHtml(payload?.adTitle || "une annonce");
    const messageContent = escapeHtml(payload?.messageText || "");
    const adUrl = payload?.adUrl || process.env.APP_BASE_URL || "http://localhost:3000";

    await transporter.sendMail({
        from: config.from,
        to,
        subject: `Nouveau message recu pour ${adTitle}`,
        text: `${senderName} vous a contacte au sujet de ${adTitle}.\n\nMessage:\n${messageContent}\n\nVoir l'annonce: ${adUrl}`,
        html: `
            <h2>Nouveau message recu</h2>
            <p><strong>${senderName}</strong> vous a contacte au sujet de <strong>${adTitle}</strong>.</p>
            <p><strong>Message:</strong></p>
            <p>${messageContent.replaceAll("\n", "<br />")}</p>
            <p><a href="${escapeHtml(adUrl)}">Voir l'annonce</a></p>
        `,
    });

    return { skipped: false };
}
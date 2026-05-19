import { query } from "@/lib/db";

export async function listMessagesForUser(userId) {
    return query(
        `
		SELECT id, contenu, date_envoi, expediteur_id, destinataire_id, annonce_id
		FROM messages
		WHERE expediteur_id = ? OR destinataire_id = ?
		ORDER BY date_envoi DESC, id DESC
		`,
        [userId, userId]
    );
}

export async function createMessage({ contenu, expediteurId, destinataireId, annonceId }) {
    const result = await query(
        `
		INSERT INTO messages (contenu, date_envoi, expediteur_id, destinataire_id, annonce_id)
		VALUES (?, NOW(), ?, ?, ?)
		`,
        [contenu, expediteurId, destinataireId, annonceId]
    );

    const rows = await query(
        `
		SELECT id, contenu, date_envoi, expediteur_id, destinataire_id, annonce_id
		FROM messages
		WHERE id = ?
		LIMIT 1
		`,
        [result.insertId]
    );

    return rows[0] ?? null;
}

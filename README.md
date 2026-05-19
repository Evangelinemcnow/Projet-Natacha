# Projet Leboncoincoin

Plateforme web de petites annonces inspiree de Leboncoin, realisee dans un cadre pedagogique (TP Developpeur Web et Web Mobile - RNCP37674).

## Avancement pedagogique (modules 1 a 11)

- Module 1: architecture fonctionnelle frontend/backend definie (routes web + API Next.js).
- Module 2: schema SQL de reference disponible dans `db/schema.sql`.
- Module 3: serveur backend operationnel avec route test `GET /api/test`.
- Module 4: CRUD annonces implementee (`/api/ads`, `/api/ads/:id`).
- Module 5: authentification inscription/connexion avec hash mot de passe + JWT cookie.
- Module 6: frontend complet (liste, detail, creation, edition, login, register, profil).
- Module 7: recherche/filtres annonces (mot-cle, categorie, prix min/max, localisation).
- Module 8: securisation de base (validation, routes protegees, requetes parametrees SQL).
- Module 9: socle accessibilite/UX (labels, formulaires semantiques, responsive).
- Module 10: notifications email sur nouveau message vendeur (SMTP via Nodemailer).
- Module 11: upload images annonces (stockage local dans `public/uploads`) + galerie.

## Module 3 - Mise en place du serveur backend

Objectif atteint: le backend Node.js (via Next.js) expose une route API de test fonctionnelle.

- Route de test: `GET /api/test`
- Fichier: `app/api/test/route.js`

Exemple de reponse JSON:

```json
{
	"success": true,
	"message": "API test route is working",
	"timestamp": "2026-04-13T10:00:00.000Z",
	"db": {
		"connected": true
	}
}
```

## Prerequis

- Node.js 18+ (recommande: version LTS recente)
- npm

## Installation

```bash
npm install
```

## Configuration MySQL

Renseigner la variable `DATABASE_URL` dans `.env`:

```env
DATABASE_URL=mysql://root:motdepasse@localhost:3306/site_annonces
```

Adaptez `root`, `motdepasse`, `localhost` et `3306` selon votre environnement.

## Configuration SMTP (module 10)

Pour activer l'envoi d'emails vendeur lors d'un nouveau message, ajouter dans `.env`:

```env
SMTP_HOST=smtp.exemple.com
SMTP_PORT=587
SMTP_USER=compte_smtp
SMTP_PASS=mot_de_passe_smtp
MAIL_FROM=no-reply@votre-domaine.fr
APP_BASE_URL=http://localhost:3000
```

Si ces variables ne sont pas definies, l'application continue de fonctionner sans envoi d'email.

## Upload images (module 11)

- Endpoint: `POST /api/uploads` (authentification requise)
- Formats acceptes: JPG, PNG, WEBP, GIF
- Taille max: 5 Mo
- Stockage: `public/uploads`
- Les URLs d'images sont rattachees a l'annonce si la table `images` est presente.

## Lancement du projet

Mode developpement:

```bash
npm run dev
```

Le serveur demarre par defaut sur:

- `http://localhost:3000`

## Tester la route API

Dans un navigateur:

- `http://localhost:3000/api/test`

Ou en ligne de commande:

```bash
curl http://localhost:3000/api/test
```

Sur PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/test
```

Si la variable `DATABASE_URL` est vide ou invalide, la route retourne `db.connected: false` avec le detail de l'erreur.

## Scripts disponibles

- `npm run dev`: lance le serveur en developpement
- `npm run build`: build de production
- `npm run start`: lance le serveur en production
- `npm run lint`: verifie le code avec ESLint

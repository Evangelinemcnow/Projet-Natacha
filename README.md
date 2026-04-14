# Projet Leboncoincoin

Plateforme web de petites annonces inspiree de Leboncoin, realisee dans un cadre pedagogique (TP Developpeur Web et Web Mobile - RNCP37674).

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

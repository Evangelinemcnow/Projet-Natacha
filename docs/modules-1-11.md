# Livrable pedagogique - Modules 1 a 11

Ce document synthese confirme l'avancement du projet jusqu'au module 11.

## Module 1 - Analyse du besoin et architecture

- Pages principales implementees: accueil, liste annonces, detail annonce, creation/edition annonce, auth, profil.
- Architecture separee frontend/backend via Next.js App Router:
  - pages web dans `app/`
  - API REST dans `app/api/`
  - services metier dans `lib/services/`

## Module 2 - Conception de la base de donnees

- Schema SQL de reference fourni dans `db/schema.sql`.
- Tables definies: utilisateurs, categories, annonces, messages, images.

## Module 3 - Mise en place du serveur backend

- Serveur Next.js operationnel.
- Route test backend: `GET /api/test`.

## Module 4 - CRUD des annonces

- Routes operationnelles:
  - `POST /api/ads`
  - `GET /api/ads`
  - `GET /api/ads/:id`
  - `PUT /api/ads/:id`
  - `DELETE /api/ads/:id`

## Module 5 - Authentification utilisateur

- Inscription et connexion operationnelles:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Hash des mots de passe avec bcrypt.
- Authentification via JWT stocke en cookie httpOnly.

## Module 6 - Interface utilisateur frontend

- UI reliee a l'API:
  - liste annonces et detail
  - formulaire creation/modification annonce
  - formulaires inscription/connexion
  - profil utilisateur

## Module 7 - Recherche et filtres

- Recherche texte sur titre/description.
- Filtres categorie, prix min/max, localisation.

## Module 8 - Securite

- Validation d'entrees utilisateur.
- Requetes SQL parametrees (protection injection SQL).
- Routes privees protegees par verification token.
- Verification du destinataire lors de l'envoi de message (doit etre le vendeur).

## Module 9 - Accessibilite et UX

- Formulaires avec labels.
- Structure semantique (main, section, article, aside, dl).
- Affichage responsive mobile/tablette/desktop.

## Module 10 - Envoi d'emails

- Notification email a la reception d'un message vendeur via Nodemailer.
- Variables SMTP a configurer dans `.env`.

## Module 11 - Upload d'images

- Endpoint upload: `POST /api/uploads`.
- Stockage local dans `public/uploads`.
- Liaison des images aux annonces si table `images` presente.
- Affichage image principale en carte + galerie en detail.

## Variables d'environnement minimales

```env
DATABASE_URL=mysql://root:motdepasse@localhost:3306/site_annonces
JWT_SECRET=change-me
APP_BASE_URL=http://localhost:3000

# Module 10 (optionnel mais recommande)
SMTP_HOST=smtp.exemple.com
SMTP_PORT=587
SMTP_USER=compte_smtp
SMTP_PASS=motdepasse_smtp
MAIL_FROM=no-reply@votre-domaine.fr
```

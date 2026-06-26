# Cité d'Innovation UCA — Frontend

Interface React moderne pour la plateforme de réservation de locaux et d'inscription aux événements.

## Prérequis

- Node.js 18+
- Backend Spring Boot sur `http://localhost:8080`

## Installation

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Accès : **http://localhost:5173**

## Build production

```bash
npm run build
npm run preview
```

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@uca.ma | admin123 |
| Admin Réservations | reservation@uca.ma | res123 |
| Admin Événements | evenement@uca.ma | evt123 |
| Demandeur INTERNE | interne@uca.ma | inter123 |
| Demandeur EXTERNE | externe@test.ma | exter123 |

## Stack

- React 19 + Vite 8
- Tailwind CSS 4
- React Router 7
- Zustand (auth)
- Axios (API)
- React Hook Form + Zod
- Framer Motion
- Recharts
- FullCalendar
- React Hot Toast

## Structure

```
src/
├── components/   # UI, layout, features
├── pages/        # public, auth, user, admin
├── services/     # API clients
├── store/        # Zustand
├── hooks/
└── utils/
```

## Variables d'environnement

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Cité d'Innovation UCA
```

En développement, le proxy Vite redirige `/api` vers le backend.

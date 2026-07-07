# CalendlyKit — Calendly Template SaaS

> Configurez votre Calendly en moins de 60 secondes avec des templates préconfigurés.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **TailwindCSS** — dark UI style Vercel/Stripe
- **Supabase** (Auth + PostgreSQL)
- **Calendly API v2** + **OAuth 2.0**
- **Axios**

---

## Setup

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. **SQL Editor** → coller et exécuter `supabase/migrations.sql`
3. Récupérer les clés dans **Settings > API**

### 3. Configurer Calendly OAuth

1. Aller sur [developer.calendly.com](https://developer.calendly.com) → **OAuth Apps**
2. Créer une nouvelle app OAuth
3. Redirect URI : `http://localhost:3000/api/auth/calendly/callback`
4. Copier `client_id` et `client_secret`

### 4. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

CALENDLY_CLIENT_ID=your-client-id
CALENDLY_CLIENT_SECRET=your-client-secret
CALENDLY_REDIRECT_URI=http://localhost:3000/api/auth/calendly/callback

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Lancer

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## Flow utilisateur

```
/login
  ↓  Créer un compte / Se connecter (Supabase Auth)
/dashboard
  ↓  "Connecter Calendly" → GET /api/auth/calendly
https://auth.calendly.com/oauth/authorize
  ↓  Autorisation utilisateur
/api/auth/calendly/callback
  ↓  Échange code → access_token → stocké en DB
/dashboard?connected=true
  ↓  Choisir un template → "Installer" → POST /api/install-template
  ↓  Boucle events[] → Calendly API v2
Modal "Votre Calendly est prêt !"
```

---

## Structure du projet

```
app/
├── api/
│   ├── auth/calendly/route.ts            # GET — initie OAuth
│   ├── auth/calendly/callback/route.ts   # GET — callback + échange token
│   ├── install-template/route.ts         # POST — installe un template
│   ├── user/calendly-status/route.ts     # GET — statut connexion
│   └── templates/route.ts               # GET — liste des templates
├── dashboard/page.tsx                    # UI principale (client)
├── login/page.tsx                        # Page auth
└── layout.tsx

lib/
├── supabase.ts          # Client browser (SSR-safe)
├── supabase-server.ts   # Clients server/middleware/admin
├── oauth.ts             # Helpers OAuth Calendly
├── calendly.ts          # Wrapper API Calendly v2
├── templates.ts         # Registre des templates
└── types.ts             # Types TypeScript

templates/
├── coach.json
├── agency.json
├── consultant.json
└── freelance.json

components/
├── AuthForm.tsx
├── CalendlyStatusBanner.tsx
├── InstallResultModal.tsx
├── Navbar.tsx
└── TemplateCard.tsx

middleware.ts              # Protection des routes
supabase/migrations.sql    # Schéma DB complet
.env.example               # Variables d'env à copier
```

---

## Ajouter un template

Créer `templates/mon-template.json` :

```json
{
  "id": "mon-template",
  "name": "Mon Template",
  "tagline": "Tagline courte",
  "description": "Description longue.",
  "icon": "🚀",
  "color": "#6366f1",
  "badge": null,
  "events": [
    {
      "name": "Nom de l'événement",
      "duration": 30,
      "description": "Description",
      "slug": "nom-evenement"
    }
  ]
}
```

Puis l'enregistrer dans `lib/templates.ts` :

```ts
import monTemplate from "@/templates/mon-template.json";

export const TEMPLATES: Template[] = [
  // ...templates existants
  monTemplate as unknown as Template,
];
```

---

## API Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/auth/calendly` | Initie le flow OAuth Calendly |
| `GET` | `/api/auth/calendly/callback` | Reçoit le code, échange le token |
| `POST` | `/api/install-template` | Body: `{ templateId }` |
| `GET` | `/api/user/calendly-status` | `{ connected, userUri }` |
| `GET` | `/api/templates` | Liste tous les templates |

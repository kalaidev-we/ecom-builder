# GitCommerce

GitCommerce is a SaaS app that lets users authenticate with GitHub, manage products, and deploy a static storefront to GitHub Pages.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + user data)
- GitHub OAuth + GitHub REST API

## Required Environment Variables

Create `.env.local` from `.env.example`.

```bash
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase Setup

Run SQL from [`supabase/schema.sql`](./supabase/schema.sql).

Tables created:
- `users`
- `stores`
- `products`
- `orders`

`stores` includes:
- `template_id` (text, default `minimal`)

## Run Locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## API Routes

- `GET /api/auth/github/login`
- `GET /api/auth/github/callback`
- `GET /api/products/list`
- `POST /api/products/create`
- `PATCH /api/products/update`
- `DELETE /api/products/delete`
- `POST /api/deploy`
- `POST /api/orders/create`
- `GET /api/templates/list`
- `POST /api/templates/select`

## App Pages

- `/` marketing + login
- `/dashboard` store overview + deploy status
- `/dashboard/products` product CRUD
- `/dashboard/deploy` deploy control panel
- `/dashboard/templates` template selector
- `/preview/[templateId]` template preview

## Templates

Template folders live in `src/templates/{templateId}`.

Each template must include:
- `index.html`
- `style.css`
- `script.js`
- `config.json`

Required placeholders:
- `{{STORE_NAME}}`
- `{{PRODUCT_LIST}}`
- `{{PRODUCT_JSON}}`

The generator loads template files by `templateId`, replaces placeholders, and outputs deployable files.
Adding a new template folder with the same contract is supported by the generator without changing generator code.

## GitHub Deployment Flow

1. Create repository (`POST /user/repos`)
2. Upload generated files (`PUT /repos/{owner}/{repo}/contents/{path}`)
3. Enable GitHub Pages (`POST /repos/{owner}/{repo}/pages`)
4. Persist deployed URL in Supabase

## Vercel Deployment

Set the same environment variables in Vercel project settings and deploy.

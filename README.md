# Vyom — Tech Blog Platform

A production-ready, SEO-optimized tech blogging platform built with **Next.js 14** (App Router). One unified codebase — API routes serve as the backend, Next.js pages as the frontend. Deploy to **Vercel** with zero configuration.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB Atlas (via Mongoose) |
| Auth | JWT (HTTP-only cookie + Bearer token) |
| Styling | Tailwind CSS v3 + custom design system |
| Editor | TipTap (rich text, tables, YouTube embeds) |
| Fonts | Syne (headings) + Inter (body) via Google Fonts |
| Deployment | Vercel (zero config) |

---

## Project Structure

```
vyom/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, theme, toast)
│   │   ├── page.tsx                # Homepage
│   │   ├── not-found.tsx           # Global 404 page
│   │   ├── sitemap.ts              # Dynamic XML sitemap
│   │   ├── robots.ts               # Dynamic robots.txt
│   │   │
│   │   ├── blog/[slug]/page.tsx    # Article page (SSR, full SEO)
│   │   ├── category/[slug]/page.tsx
│   │   ├── author/[slug]/page.tsx
│   │   ├── search/                 # Search page (client-side)
│   │   │
│   │   ├── (pages)/                # Route group: static public pages
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── authors/
│   │   │   ├── categories/
│   │   │   ├── sitemap/            # HTML sitemap
│   │   │   ├── privacy-policy/
│   │   │   ├── terms/
│   │   │   ├── disclaimer/
│   │   │   ├── editorial-policy/
│   │   │   ├── cookie-policy/
│   │   │   └── advertise/
│   │   │
│   │   ├── admin/                  # Admin panel (JWT-guarded)
│   │   │   ├── layout.tsx          # Sidebar + auth guard
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── articles/           # List + create + edit
│   │   │   ├── categories/
│   │   │   ├── authors/
│   │   │   ├── tags/
│   │   │   ├── messages/
│   │   │   └── settings/
│   │   │
│   │   └── api/                    # All API routes (backend)
│   │       ├── auth/               # POST /login, GET /me, DELETE /logout
│   │       ├── articles/           # Full CRUD + filters + pagination
│   │       ├── categories/
│   │       ├── authors/
│   │       ├── tags/
│   │       ├── newsletter/
│   │       ├── contact/
│   │       ├── settings/
│   │       └── seo/
│   │           ├── sitemap/        # XML sitemap (also served by sitemap.ts)
│   │           └── rss/            # RSS 2.0 feed
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Sticky header, dynamic categories, theme toggle
│   │   │   ├── Footer.tsx          # Newsletter, dynamic categories, legal links
│   │   │   └── PublicLayout.tsx    # Header + Footer wrapper
│   │   ├── blog/
│   │   │   ├── ArticleCard.tsx     # default / featured / horizontal variants
│   │   │   ├── ShareButtons.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── admin/
│   │   │   ├── RichEditor.tsx      # TipTap editor (H1-H6, lists, tables, images, YouTube)
│   │   │   └── ArticleEditorForm.tsx # Full article editor with SEO accordion
│   │   └── common/
│   │       ├── ContactForm.tsx
│   │       └── GoogleAnalytics.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                   # MongoDB singleton connection
│   │   ├── models.ts               # All Mongoose models (User, Article, Category, Author, Tag, Subscriber, Contact, Setting)
│   │   ├── auth.ts                 # JWT sign/verify, password hash, requireAuth middleware
│   │   └── utils.ts                # cn(), makeSlug(), calcReadingTime(), formatDate(), shareUrl()
│   │
│   ├── middleware.ts               # Server-side /admin route protection
│   ├── scripts/seed.ts             # Admin + default data seeder
│   ├── styles/globals.css
│   └── types/index.ts
│
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd vyom
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
```

### 3. Seed the database

Creates the admin user, default categories, and site settings:

```bash
npm run seed
```

Output:
```
✅  Admin created: 
✅  Category: Smartphones
✅  Category: Laptops
...
🎉  Seed complete!
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  
Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. Database Access → Add user (read/write)
3. Network Access → Add IP `0.0.0.0/0` (for Vercel)
4. Connect → Drivers → Copy connection string
5. Replace `<password>` and paste into `MONGODB_URI`

---

## Vercel Deployment

1. Push your code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy — Vercel auto-detects Next.js

**Required Vercel env vars:**


After first deploy, run seed once:

```bash
# In Vercel project → Settings → Functions → set NODE_ENV=production
# Then locally with production MONGODB_URI:
MONGODB_URI="mongodb+srv://..." npm run seed
```

---

## Features

### Public Site
- **Homepage** — Featured articles hero, latest grid, trending sidebar, category browser
- **Article pages** — Full SSR, Open Graph, Twitter Cards, JSON-LD schema, breadcrumbs, share buttons, author card, related articles
- **Category pages** — Paginated article lists per category
- **Author pages** — Author profile + all their articles
- **Search** — Client-side search with category filter and tag filter
- **Newsletter** — Subscribe form in footer, stored in MongoDB
- **Dark mode** — System default + manual toggle, persisted

### SEO
- `sitemap.ts` → auto-generated `/sitemap.xml` (all articles, categories, authors, static pages)
- `robots.ts` → `/robots.txt`
- `/api/seo/rss` → RSS 2.0 feed at `/api/seo/rss`
- Open Graph + Twitter Card metadata on every page
- JSON-LD Article schema on article pages
- Canonical URLs, meta title, meta description, keywords
- Breadcrumb navigation

### Admin Panel (`/admin`)
- **Dashboard** — Article stats, recent articles, quick actions
- **Articles** — Create/edit/delete, publish/unpublish, schedule publishing, search/filter
- **Rich Editor** — TipTap with H1-H6, bold/italic/strike, lists, blockquote, code blocks, tables, image URL insert, YouTube embed, undo/redo
- **SEO accordion** — Override slug, meta title, meta description, keywords, canonical URL per article
- **Categories** — Full CRUD, enable/disable, show in nav/footer toggle, ordering
- **Authors** — Full CRUD with avatar URL, bio, social links
- **Tags** — List and delete; tags are auto-created from article tags
- **Messages** — View contact form submissions, mark read/replied, email reply link
- **Settings** — Site name/tagline/URL, social links, Google Analytics ID, AdSense publisher ID

### Security
- JWT in HTTP-only cookie (no localStorage)
- Server-side middleware protects all `/admin` routes
- API routes validate token on every request
- Passwords hashed with bcrypt (12 rounds)
- Security headers via `next.config.js`

---

## API Reference

All routes are under `/api/`. Auth routes require `Authorization: Bearer <token>` header or the `vyom_token` cookie.

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns token |
| GET | `/api/auth` | ✓ | Get current user |
| DELETE | `/api/auth` | — | Logout (clears cookie) |

### Articles
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/articles` | — | Published articles (paginated, filterable) |
| GET | `/api/articles?admin=true` | ✓ | All articles incl. drafts |
| POST | `/api/articles` | ✓ | Create article |
| GET | `/api/articles/[id]` | — | Single article by slug or ID |
| PUT | `/api/articles/[id]` | ✓ | Update article |
| DELETE | `/api/articles/[id]` | ✓ | Delete article |

**Query params for GET /api/articles:**
- `page`, `limit`, `sort` — pagination
- `search` — text search
- `category` — filter by category ID
- `tag` — filter by tag name
- `status` — filter by status (admin only)

### Categories, Authors, Tags
Standard CRUD at `/api/categories`, `/api/authors`, `/api/tags`. See source for full details.

### Newsletter
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/newsletter` | Subscribe |
| GET | `/api/newsletter` | List subscribers (auth) |

### Contact
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contact` | Send message |
| GET | `/api/contact` | List messages (auth) |
| PATCH | `/api/contact/[id]` | Update status (auth) |
| DELETE | `/api/contact/[id]` | Delete (auth) |

### Settings & SEO
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings` | Get all settings |
| PUT | `/api/settings` | Update settings (auth) |
| GET | `/api/seo/rss` | RSS 2.0 feed |
| GET | `/api/seo/sitemap` | XML sitemap |

---

## Google AdSense

1. Apply at [adsense.google.com](https://adsense.google.com)
2. All required pages are included: About, Contact, Privacy Policy, Terms, Disclaimer, Editorial Policy, Cookie Policy, Advertise
3. Once approved, add your publisher ID in **Admin → Settings → Google AdSense**
4. Place ad units via AdSense dashboard (auto ads or manual placement)

---

## Customization

### Adding a new category
Admin → Categories → New Category → fill name → Save. It appears in the header nav, footer, category pages, and article editor instantly — no code change needed.

### Changing the color scheme
Edit `tailwind.config.js` → `theme.extend.colors.brand`. The entire UI uses `brand-*` tokens.

### Adding a new static page
Create `src/app/(pages)/your-page/page.tsx` following the pattern of existing pages (wrap with `<PublicLayout>`). Add to footer links in `Footer.tsx` and `sitemap.ts`.

---

## License

MIT — free to use for personal and commercial projects.

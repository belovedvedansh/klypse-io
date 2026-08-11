# Klypse.io

**Premium AI clipping for everyone.**

Klypse.io turns long-form VODs, livestreams, gameplay sessions, podcasts, and creator content into powerful, export-ready short-form clips — free.

---

## Architecture

```
klypse-io/
├── apps/
│   ├── web/          # Next.js 14 frontend (marketing + creator app + admin)
│   └── api/          # Fastify backend (REST API + job processing)
├── packages/
│   ├── shared/       # Shared types, constants, and utilities
│   └── config/       # Shared configuration (quotas, retention, feature flags)
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Fastify, TypeScript |
| Database | PostgreSQL 16 + Drizzle ORM |
| Queue | BullMQ + Redis |
| Storage | Local / S3-compatible |
| Auth | NextAuth.js (Google OAuth) |
| AI/ML | Whisper, MediaPipe, OpenAI |

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for Postgres + Redis)
- npm >= 10

### Setup

```bash
# 1. Clone the repo
git clone <repo-url> klypse-io
cd klypse-io

# 2. Copy environment config
cp .env.example .env
# Edit .env with your credentials

# 3. Start infrastructure
docker-compose up -d

# 4. Install dependencies
npm install

# 5. Run database migrations
npm run db:migrate

# 6. Start development servers
npm run dev
```

This starts:
- **Web app** at `http://localhost:3000`
- **API server** at `http://localhost:4000`

### Individual Services

```bash
npm run dev:web   # Frontend only
npm run dev:api   # Backend only
```

### Database

```bash
npm run db:generate   # Generate migrations from schema changes
npm run db:migrate    # Apply pending migrations
npm run db:studio     # Open Drizzle Studio (DB browser)
```

## Project Structure

### `apps/web/` — Frontend

- `src/app/(marketing)/` — Public marketing pages
- `src/app/(app)/` — Authenticated creator workspace
- `src/app/(admin)/` — Admin console
- `src/app/auth/` — Authentication flows
- `src/components/` — Reusable UI components
- `src/lib/` — Utilities, API client, auth helpers
- `src/styles/` — Design tokens and custom CSS
- `src/hooks/` — Custom React hooks
- `src/store/` — Client state management

### `apps/api/` — Backend

- `src/modules/` — Feature modules (auth, users, projects, clips, etc.)
- `src/db/schema/` — Drizzle ORM schema definitions
- `src/queue/` — BullMQ job queue and workers
- `src/storage/` — File storage adapter (local/S3)
- `src/services/` — Cross-cutting services (quotas, flags, retention)
- `src/config/` — Environment and feature configuration
- `src/utils/` — Logging, errors, validation

### `packages/shared/` — Shared Code

- `src/types/` — TypeScript interfaces shared across apps
- `src/constants/` — Quota defaults, retention policies, feature flags
- `src/utils/` — Pure utility functions

## Environment Variables

See [`.env.example`](./.env.example) for all configuration options.

## License

Proprietary. All rights reserved.

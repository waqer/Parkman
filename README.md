# Parkman — Parking Zone Viewer

A full-stack application to browse parking zones in Helsinki.

Built with **plain PHP REST API** backend and **Vue 3 + TypeScript** frontend.

---

## Tech Stack

| Layer     | Technology                                                    |
|-----------|---------------------------------------------------------------|
| Backend   | PHP 8.2, MySQL 8, PDO (raw SQL, no ORM)                      |
| Frontend  | Vue 3, TypeScript, Vite, Vue Router 4                         |
| Map       | Leaflet.js                                                    |
| Testing   | PHPUnit (backend), Vitest + Vue Test Utils (frontend)         |
| Container | Docker + Docker Compose                                       |

---

## Project Structure

```
parkman/
├── .env                   # Environment config — switch between Docker and XAMPP here
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── config.php         # DB connection — reads .env / env vars, with safe defaults
│   ├── index.php          # Router + CORS headers + HTTP status codes
│   ├── routes.php         # get_zones() and get_zone(id) — raw SQL queries
│   ├── migrate.php        # Creates the zones table
│   ├── seed.php           # Inserts 10 realistic Helsinki zones
│   ├── composer.json      # Backend dependencies + setup/test scripts
│   ├── .htaccess          # Apache mod_rewrite rules
│   └── tests/
│       ├── ZonesApiTest.php
│       └── test_api.php
│
└── frontend/
    ├── src/
    │   ├── styles/
    │   │   └── theme.css          # Shared design tokens — dark & light mode
    │   ├── types/
    │   │   └── zone.ts            # TypeScript interfaces
    │   ├── utils/
    │   │   └── constants.ts       # API_BASE URL + display metadata
    │   ├── composables/
    │   │   ├── useZones.ts        # Fetch list + search / filter / sort state
    │   │   ├── useZoneDetail.ts   # Fetch single zone, handle 404
    │   │   └── useTheme.ts        # Dark / light mode + localStorage
    │   ├── router/
    │   │   └── index.ts
    │   ├── views/
    │   │   ├── ZoneList.vue
    │   │   └── ZoneDetail.vue
    │   ├── components/
    │   │   ├── AppHeader.vue
    │   │   ├── StatusBadge.vue
    │   │   └── ZoneMap.vue
    │   └── __tests__/
    │       ├── StatusBadge.test.ts
    │       ├── useZones.test.ts
    │       └── performance.test.ts
    ├── vitest.config.ts
    └── vite.config.ts
```

---

## API Endpoints

| Method | Endpoint          | Status | Description                                        |
|--------|-------------------|--------|----------------------------------------------------|
| GET    | `/api/zones`      | 200    | List all zones (id, name, type, status)            |
| GET    | `/api/zones/{id}` | 200    | Full zone detail                                   |
| GET    | `/api/zones/{id}` | 404    | `{ "error": "Zone with id N not found." }`         |

---

## Option 1 — Docker (recommended)

The easiest way to run the full stack with one command. No local PHP or MySQL needed.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/waqer/Parkman.git
cd parkman
```

**2. Make sure `.env` is set to Docker (Option A)**

Open `.env` in the project root and confirm these lines are active:
```env
API_BASE_URL=http://localhost:8080/api
DB_HOST=db
DB_PORT=3306
DB_NAME=parkman
DB_USER=root
DB_PASS=secret
```

**3. Start all services**
```bash
docker compose up --build
```

| Container          | What it runs       | Host port |
|--------------------|--------------------|-----------|
| `parkman_db`       | MySQL 8            | 3307      |
| `parkman_backend`  | PHP 8.2 + Apache   | 8080      |
| `parkman_frontend` | Node 20 / Vite     | 5173      |

**4. Set up the database (first time only)**

Wait ~15 seconds for MySQL to initialise, then:
```bash
docker compose exec backend php migrate.php
docker compose exec backend php seed.php
```

**5. Open the app**

| Service  | URL                               |
|----------|-----------------------------------|
| Frontend | http://localhost:5173             |
| API list | http://localhost:8080/api/zones   |
| API zone | http://localhost:8080/api/zones/1 |

**6. Stop everything**
```bash
docker compose down

# Full reset including the database volume:
docker compose down -v
```

---

## Option 2 — XAMPP

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) with Apache and MySQL running
- Node.js 18+
- Composer

### 1. Place the project in your htdocs

Clone or copy the project into your XAMPP `htdocs` folder. The folder name is your choice:

```
C:/xampp/htdocs/<your-folder-name>/
├── .env
├── backend/
└── frontend/
```

Examples of valid folder names:
```
C:/xampp/htdocs/parkman/
C:/xampp/htdocs/myproject/
C:/xampp/htdocs/claudePark/
```

### 2. Enable mod_rewrite in XAMPP

Open `C:/xampp/apache/conf/httpd.conf` and update these two settings:

```apache
LoadModule rewrite_module modules/mod_rewrite.so   # remove leading # if present

<Directory "C:/xampp/htdocs">
    AllowOverride All    # change None → All
</Directory>
```

Restart Apache after saving.

### 3. Create the database

Open `http://localhost/phpmyadmin` → create a new database named `parkman`.

### 4. Configure `.env` for XAMPP

Open `.env` in the project root. Comment out Option A and fill in Option B with your actual folder name:

```env
# Option B: XAMPP
API_BASE_URL=http://localhost/<your-folder-name>/backend/api
DB_HOST=localhost
DB_PORT=3306
DB_NAME=parkman
DB_USER=root
DB_PASS=
```

For example if your folder is named `parkman`:
```env
API_BASE_URL=http://localhost/parkman/backend/api
```

### 5. Run migration and seed

```bash
cd <your-project-path>/backend

composer install
composer run setup
```

`composer run setup` runs `migrate.php` then `seed.php` in one step.

### 6. Update the frontend API URL

Open `frontend/src/utils/constants.ts` and update `API_BASE` to match your folder name:

```ts
// Change <your-folder-name> to whatever you used in htdocs
export const API_BASE = 'http://localhost/<your-folder-name>/backend'
```

For example:
```ts
export const API_BASE = 'http://localhost/parkman/backend'
```

### 7. Run the frontend

```bash
cd <your-project-path>/frontend

npm install
npm install vue-router@4 leaflet
npm install --save-dev @types/leaflet

npm run dev
```

Open `http://localhost:5173`

---

## Running the Tests

### Frontend — Vitest

```bash
cd frontend

# Install test dependencies (first time only)
npm install --save-dev vitest @vue/test-utils jsdom @vitest/coverage-v8

npm test              # run all tests
npm run test:coverage # run with coverage report
npx vitest --ui
```

Expected output:
```
✓ src/__tests__/performance.test.ts  (1 test)
✓ src/__tests__/useZones.test.ts    (12 tests)
✓ src/__tests__/StatusBadge.test.ts  (3 tests)

Tests  16 passed (16)
```

| Test file | What it covers |
|---|---|
| `StatusBadge.test.ts` | Component renders correct label and colour for every status |
| `useZones.test.ts` | Search, type filter, status filter, combined filters, sort toggle |
| `performance.test.ts` | Filter + sort of 500 zones completes in under 20ms |

### Backend — PHPUnit

```bash
cd backend

composer install
composer run test
```

### Backend — API integration test (no PHPUnit needed)

Runs against the live server. Make sure Apache and MySQL are running first.

```bash
# XAMPP
php backend/tests/test_api.php

# Docker
docker compose exec backend php tests/test_api.php
```

---

## Decisions & Trade-offs

**Plain PHP**
As project specifically asked for plain PHP. I built a simple URI router in `index.php` so the backend stays lightweight and dependency-free. This makes it easy to read and maintain for a small number of endpoints. However, if the API grows beyond ~10 endpoints, it would become hard to maintain, and using a micro-framework like Slim would make more sense.

**Raw SQL with PDO — no ORM**
All queries use PDO prepared statements. This keeps the SQL explicit and easy to audit. The downside is more boilerplate as the schema grows. For a larger project I would think of adding a query builder.

**JSON columns for amenities and opening_hours**
Stored as JSON rather than separate relational tables. This works well for a read-heavy API where you never filter *by* amenity. If the product needed "find all zones with EV charging" the schema would need normalisation.

**config.php reads environment variables first**
In config.php, I first check environment variables like DB_HOST before falling back to defaults. This makes the same configuration file work for both Docker (where environment variables are injected) and XAMPP (where defaults are used). It avoids maintaining separate configs for different environments.

**theme.css imported globally in main.ts**
I put the CSS variables for dark and light themes in a global file and import it in main.ts. I avoided putting it in a scoped `<style>` block because Vite appends a unique `data-v-*` attribute to scoped styles. That would break selectors like `[data-theme="dark"]`. Importing in `main.ts` keeps selectors clean and unscoped.

**Composables for all data fetching**
Logic lives in `useZones`, `useZoneDetail`, and `useTheme` rather than inside view components. This makes views thin templates and keeps business logic independently testable without mounting any DOM.

---

## What I Would Improve Given More Time

- **Authentication**
- **Zone CRUD** — endpoints with an admin UI
- **Server-side search** — move from client-side filtering to `GET /api/zones?q=kamppi` with a MySQL `LIKE` query so it scales with large datasets
- **Pagination** — `?page=&limit=` query params on the list endpoint
- **Map overview** — a single map showing all zones as pins, click-to-navigate to detail
- **More PHPUnit coverage**
- **GitHub Actions CI** — run `vitest` and `phpunit` on every pull request automatically
- **Error logging** — structured logging to a file or Sentry instead of PHP default errors
- **Production Dockerfiles** — replace inline `command:` scripts in docker-compose with proper per-service `Dockerfile`s for cleaner production builds
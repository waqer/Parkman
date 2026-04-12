# Parkman — Parking Zone Viewer

A full-stack application to browse parking zones in Helsinki.

Built with **plain PHP REST API** backend and **Vue 3 + TypeScript** frontend.

---

## 🌐 Live Demo

The application is hosted on **Amazon Lightsail** and publicly accessible:

| Service  | URL |
|----------|-----|
| **Frontend** | **http://51.20.125.185:5173/** |
| API list | http://51.20.125.185:8080/api/zones |
| API zone | http://51.20.125.185:8080/api/zones/1 |

> No setup required — just open the link in your browser.

---

## Tech Stack

| Layer     | Technology                                            |
|-----------|-------------------------------------------------------|
| Backend   | PHP 8.2, MySQL 8, PDO (raw SQL, no ORM)              |
| Frontend  | Vue 3, TypeScript, Vite, Vue Router 4                 |
| Map       | Leaflet.js                                            |
| Testing   | PHPUnit (backend), Vitest + Vue Test Utils (frontend) |
| Container | Docker + Docker Compose                               |
| Hosting   | Amazon Lightsail (Ubuntu 22.04, Stockholm region)     |

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
│   ├── entrypoint.sh      # Auto runs migrate + seed before Apache starts
│   ├── Dockerfile
│   ├── composer.json      # Backend dependencies + setup/test scripts
│   ├── .htaccess          # Apache mod_rewrite rules
│   └── tests/
│       ├── ZonesApiTest.php
│       └── test_api.php
│
└── frontend/
    ├── Dockerfile
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

The easiest way to run the full stack locally. **Migration and seeding run automatically** — no manual setup needed after `docker compose up`.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/waqer/Parkman.git
cd Parkman
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

The backend container automatically:
1. Waits for MySQL to be ready
2. Runs `migrate.php` — creates the table
3. Runs `seed.php` — inserts 10 Helsinki zones
4. Starts Apache

**4. Open the app**

| Service  | URL                               |
|----------|-----------------------------------|
| Frontend | http://localhost:5173             |
| API list | http://localhost:8080/api/zones   |
| API zone | http://localhost:8080/api/zones/1 |

**5. Stop everything**
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
export const API_BASE = 'http://localhost/<your-folder-name>/backend'

// Example:
// export const API_BASE = 'http://localhost/parkman/backend'
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

## Option 3 — Amazon Lightsail (cloud server)

This is how the live demo above is hosted. Use this if you want to deploy to your own cloud server.

### Prerequisites
- A Lightsail Ubuntu instance (or any Ubuntu 22.04 VPS)
- SSH access to the server

### 1. SSH into your server

```bash
ssh ubuntu@<your-server-ip>
```

### 2. Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
newgrp docker
```

### 3. Clone the repository

```bash
git clone https://github.com/waqer/Parkman.git
cd Parkman
```

### 4. Open firewall ports in Lightsail

In your Lightsail console → **Networking** → **IPv4 Firewall** → **Add rule**:

| Protocol | Port | Purpose |
|----------|------|---------|
| TCP | 5173 | Vue frontend |
| TCP | 8080 | PHP backend API |

### 5. Start everything

```bash
docker-compose up --build -d
```

Migration and seeding run automatically. No manual steps needed.

### 6. Access the app

Replace `<your-server-ip>` with your Lightsail public IPv4:

| Service  | URL |
|----------|-----|
| Frontend | `http://<your-server-ip>:5173` |
| API list | `http://<your-server-ip>:8080/api/zones` |

### 7. Keep it running after reboot

```bash
docker-compose up -d
```

> **Note:** If your Lightsail instance stops and restarts, the public IP may change unless you attach a static IP. Do this in Lightsail → **Networking** → **Attach static IP**.

---

## Running the Tests

### Frontend — Vitest

```bash
cd frontend

# Install test dependencies (first time only)
npm install --save-dev vitest @vue/test-utils jsdom @vitest/coverage-v8

npm test              # run all tests
npm run test:coverage # run with coverage report
npx vitest --ui       # visual browser UI
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

# Lightsail (live server)
curl http://51.20.125.185:8080/api/zones
```

---

## Decisions & Trade-offs

**Plain PHP with no framework**
The project brief asked for plain PHP. I built a simple URI router in `index.php` so the backend stays lightweight and dependency-free. This makes it easy to read and maintain for a small number of endpoints. However, if the API grows beyond ~10 endpoints, it would become hard to maintain, and using a micro-framework like Slim would make more sense.

**Raw SQL with PDO — no ORM**
All queries use PDO prepared statements. This keeps the SQL explicit and easy to audit. The downside is more boilerplate as the schema grows. For a larger project I would add a query builder.

**JSON columns for amenities and opening_hours**
Stored as JSON rather than separate relational tables. This works well for a read-heavy API where you never need to filter *by* amenity. If the product needed "find all zones with EV charging" the schema would need normalising.

**config.php reads environment variables first**
`getenv('DB_HOST') ?: 'db'` makes the same `config.php` work in Docker (env vars injected by docker-compose), XAMPP (values from `.env`), and cloud servers. No separate config files per environment.

**entrypoint.sh for automatic database setup**
Instead of requiring manual `migrate.php` and `seed.php` steps after deployment, the backend container runs an entrypoint script that waits for MySQL to be ready, then migrates and seeds automatically before Apache starts. Anyone who runs `docker compose up` gets a fully working app with data, zero extra commands.

**theme.css imported globally in main.ts**
CSS variables for dark and light mode live in a global file imported in `main.ts`. If placed inside a scoped `<style>` block, Vite appends a unique `data-v-*` attribute to every selector — breaking `[data-theme="dark"]`. Importing globally keeps selectors clean.

**Composables for all data fetching**
Logic lives in `useZones`, `useZoneDetail`, and `useTheme` rather than inside view components. This makes views thin templates and keeps business logic independently testable without mounting any DOM.

---

## What I Would Improve Given More Time

- **Mobile app (Flutter)** — a dedicated iOS/Android app with GPS-based navigation to the nearest available parking zone, real-time availability updates, and price filtering so drivers can find the cheapest option nearby before they leave home

- **Authentication** — JWT tokens so only authorised users can view or manage zones

- **Zone CRUD** — `POST`, `PUT`, `DELETE` endpoints with an admin UI for managing zones

- **Server-side search** — move from client-side filtering to `GET /api/zones?q=kamppi` with MySQL `FULLTEXT` so it scales with large datasets

- **Pagination** — `?page=&limit=` query params on the list endpoint

- **Real-time availability** — WebSocket updates so the map reflects live capacity changes as drivers arrive and leave

- **Map overview** — a single map showing all zones as pins simultaneously, click to navigate to detail

- **More PHPUnit coverage** — integration tests that boot the real HTTP router

- **GitHub Actions CI** — run `vitest` and `phpunit` automatically on every pull request

- **Error logging** — structured logging to a file or Sentry instead of PHP default error output

- **Production Dockerfiles** — replace inline `command:` scripts in docker-compose with proper per-service `Dockerfile`s for cleaner production

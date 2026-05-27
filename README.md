# Mizuhara Frontend

Mizuhara is a Nuxt/Vue frontend for a modular home-management system backed by an API Platform / Hydra JSON-LD backend.

The project is currently focused on shopping lists and user management, with a broader roadmap for household, planning, accounting, documents, tasks, smart-home workflows, recipes, and local AI.

## Current Features

- Nuxt 4 / Vue 3 application with TypeScript
- Mobile-first layout with drawer navigation
- Internationalization with German and English locales
- API Platform / Hydra collection handling via a shared API client
- Automatic mock fallback when the backend is unavailable
- Visible mock-data banner with reconnect action
- MSW-powered local mock data for offline/demo usage

## Implemented Modules

### Users

- List users
- Create users
- Edit users
- Delete users
- Use users as owners/contributors in shopping-list workflows
- Mock users include `kira` and `misha`

### Shopping Lists

- List shopping-list collections
- Create, edit, and delete collections
- Create, edit, and delete shopping lists inside collections
- View shopping-list entries
- Add entries with product, quantity, and user
- Edit entries
- Delete entries
- Mark entries as acquired
- Prompt to delete a shopping list when all entries are acquired
- Mock shopping list includes example entries such as milk, bread, eggs, and butter

### Catalog Basics

- Product information is currently used to populate shopping-list entry product choices
- Mock product data is available for offline/demo mode

## Mock Fallback

By default, Mizuhara runs in `auto` API mode:

1. The frontend tries to reach the backend at `${NUXT_PUBLIC_API_BASE}/api`.
2. If the backend does not respond within the configured timeout, MSW starts automatically.
3. A banner shows that mock data is being displayed.
4. The user can retry the backend connection from the banner or from the shopping-list refresh action.

Environment options:

```bash
NUXT_PUBLIC_API_BASE=http://localhost:8000
NUXT_PUBLIC_API_MODE=auto
NUXT_PUBLIC_API_FALLBACK_TIMEOUT_MS=1800
```

Supported API modes:

- `auto`: try backend first, fall back to mocks
- `mock`: always use mocks
- `live`: use backend only, no fallback

MSW requires `public/mockServiceWorker.js`, generated with:

```bash
npx msw init public --save
```

## Tech Stack

- Nuxt 4
- Vue 3 Composition API
- TypeScript
- API Platform / Hydra JSON-LD
- Nuxt i18n
- Pinia
- MSW
- Nuxt Icon
- ESLint
- Prettier

## Project Structure

```text
.
├─ components/              # Shared UI components
├─ composables/api/         # API client and mock/reconnect state
├─ config/                  # Navigation config
├─ i18n/locales/            # German and English translations
├─ modules/
│  ├─ catalog/              # Product information services and mocks
│  ├─ shoppingList/         # Shopping-list services, requests, mocks
│  └─ user/                 # User services, requests, mocks
├─ pages/                   # Nuxt routes
├─ public/                  # Static assets and MSW worker
├─ services/resource/       # Shared resource/IRI helpers
├─ shared/mocks/            # MSW setup, handler aggregation, mock utilities
└─ types/api/               # API resource types
```

## Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Quality checks:

```bash
npm run lint
npm run format:check
npx nuxi typecheck
```

Pre-commit cleanup/check:

```bash
npm run precommit
```

## Backend Coverage

The local backend API documentation currently exposes these relevant resources:

- User
- ProductInformation
- ShoppingListCollection
- ShoppingList
- ShoppingListEntry
- GenericTask
- TaskEntry
- InventoryItemCategory
- InventoryStockItem
- OnlineShop
- PhysicalStore
- ProductBrand
- ProductSupplySource
- StockInbound
- StockOutbound
- SupplySource

Shopping-list and user CRUD workflows are implemented in the frontend. Product information is partially implemented as read-only support data for shopping-list entries.

## Roadmap

Planned modules based on the backend API documentation:

- Product catalog
- Inventory
- Stock inbound
- Stock outbound
- Supply sources
- Online shops
- Physical stores
- Product brands
- Generic tasks
- Task entries

Planned modules beyond the current API documentation:

- Tasks
- Documents
- Accounting
- Smart Home
- Recipes
- Planner
- Local AI

## Development Principles

- Keep features module-oriented under `modules/`
- Use typed services for API access
- Keep resource types under `types/api/`
- Prefer endpoint constants over hard-coded API paths
- Keep mock data close to the module it represents
- Keep global mock wiring in `shared/mocks/`
- Keep UI copy in i18n locale files
- Make offline/demo states explicit to the user

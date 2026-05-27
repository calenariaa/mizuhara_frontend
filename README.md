# Mizuhara Frontend

Mizuhara is a Nuxt/Vue frontend for a modular home-management system backed by an API Platform / Hydra JSON-LD backend.

The project is currently focused on shopping lists, user management, and generic tasks, with a broader roadmap for household inventory, planning, accounting, documents, smart-home workflows, recipes, and local AI.

## Current Features

- Nuxt 4 / Vue 3 application with TypeScript
- Mobile-first layout with drawer navigation
- Internationalization with German and English locales
- API Platform / Hydra collection handling via a shared API client
- Automatic mock fallback when the backend is unavailable
- Visible mock-data banner with reconnect action that stays above the app while scrolling
- Refresh/reconnect actions for retrying the live backend after mock fallback
- MSW-powered local mock data for offline/demo usage

## Implemented Modules

### Users

- List users
- Create users
- Edit users
- Delete users
- Use users as owners/contributors in shopping-list and task workflows
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

### Tasks

- List generic tasks
- Create tasks and assign them to users
- Edit task assignee and status
- Delete tasks
- Mark tasks as completed and reopen them
- List task entries
- Create, edit, and delete task entries
- Show API status values in a readable format, for example `in progress`
- MSW mock data for tasks and task entries

### Catalog Basics

- Product information is currently used to populate shopping-list entry product choices
- Mock product data is available for offline/demo mode

## Mock Fallback

By default, Mizuhara runs in `auto` API mode:

1. The frontend tries to reach the backend at `${NUXT_PUBLIC_API_BASE}/api`.
2. If the backend does not respond within the configured timeout, MSW starts automatically.
3. A banner shows that mock data is being displayed.
4. The user can retry the backend connection from the banner or from module refresh actions.

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
|-- components/              # Shared UI components
|-- composables/api/         # API client and mock/reconnect state
|-- config/                  # Navigation config
|-- i18n/locales/            # German and English translations
|-- modules/
|   |-- catalog/             # Product information services and mocks
|   |-- shoppingList/        # Shopping-list services, requests, mocks
|   |-- tasks/               # Task services, requests, mocks
|   `-- user/                # User services, requests, mocks
|-- pages/                   # Nuxt routes
|-- public/                  # Static assets and MSW worker
|-- services/resource/       # Shared resource/IRI helpers
|-- shared/mocks/            # MSW setup, handler aggregation, mock utilities
`-- types/api/               # API resource types
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

Shopping-list, user, and task workflows are implemented in the frontend. Product information is partially implemented as read-only support data for shopping-list entries.

The current backend API documentation does not expose concurrency primitives such as ETags, resource versions, locks, lock owners, lock expiry, Mercure, SSE, or WebSocket channels. Multi-user conflict handling should therefore be added backend-side before the frontend can guarantee safe concurrent editing.

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
- Multi-user conflict handling with optimistic locking, optional soft locks, and live updates

Planned modules beyond the current API documentation:

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

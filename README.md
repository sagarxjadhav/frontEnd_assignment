# Customer Tagging Tool — Frontend

A React + TypeScript frontend for bulk-tagging Shopify customers. Filter customers by spend, order count, or recency, preview the impact of a tag operation, then apply it in one click.

The backend GraphQL API lives in the companion `Backend/` repo and must be running before the frontend will work.

---

## Prerequisites

- Node.js 18+
- npm 9+
- The backend API running at `http://localhost:4000` (see `Backend/API.md`)

---

## Setup

```bash
# 1. Clone and enter the repo
git clone https://github.com/sagarxjadhav/frontEnd_assignment.git
cd frontEnd_assignment

# 2. Install dependencies
npm install

# 3. Create your local env file
cp .env.example .env
# Default value is already correct for local development:
# VITE_GRAPHQL_URL=http://localhost:4000/graphql

# 4. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

> Make sure the backend API is already running (`npm run dev` inside `Backend/`) before opening the frontend — otherwise the filter query will show a connection error with the API URL in the message.

---

## How to run the type checker

```bash
npm run typecheck
```

There are no frontend unit tests in this repo (see "What's incomplete" below). The backend test suite lives in `Backend/` and is run with `npm test` from that directory.

---

## App structure

```
src/
├── main.tsx               Entry point — mounts ApolloProvider + App
├── App.tsx                Root component; owns filter state and query
├── types.ts               TypeScript interfaces matching the GraphQL schema
├── graphql/
│   ├── client.ts          Apollo Client instance (URL from env var)
│   └── operations.ts      All GraphQL query/mutation documents
├── components/
│   ├── FilterForm.tsx     Three optional filter inputs; fires on submit only
│   ├── CustomerTable.tsx  Presents filtered customers in a table
│   ├── TagPanel.tsx       Tag input, action selector, preview, apply
│   ├── ConfirmDialog.tsx  Modal used for destructive (REMOVE) confirmation
│   └── TagHistory.tsx     Session history of applied tag operations
└── styles/
    └── index.css          Single flat CSS file — no framework
```

### Data flow

1. User fills `FilterForm` and clicks **Find Customers**.
2. `App` fires `filterCustomers` via `useLazyQuery` — results populate `CustomerTable`.
3. User types a tag in `TagPanel`, picks ADD or REMOVE, clicks **Preview**.
4. `TagPanel` calls `applyCustomerTag(dryRun: true)` — shows affected count with no data changed.
5. User clicks **Apply**. For REMOVE, `ConfirmDialog` appears first.
6. On confirm, `applyCustomerTag(dryRun: false)` runs. `App` refetches the filter query (tag badges update in the table) and bumps `historySignal` so `TagHistory` refetches.

---

## Decisions & trade-offs

### 1. `useLazyQuery` — query fires on submit, not on keystroke

The filter query only fires when the user explicitly clicks **Find Customers**, not on every field change. This avoids hammering the API with partial inputs and matches how Shopify's own segment UI works — build the criteria, then run it. The trade-off is that results don't update reactively as you type. For a bulk-action tool where an accidental large result set could lead to an unwanted mass-tag, I think an explicit submit is the right call.

### 2. Mandatory preview step before apply

Rather than jumping straight to a confirm dialog, I made the dry-run preview a required intermediate step. The user sees exactly how many customers will be affected before any confirmation appears. This costs one extra API round-trip but significantly reduces the chance of an accidental mass-tag — the primary risk in a bulk-action tool.

### 3. Plain CSS over Tailwind or a component library

The brief says visual polish is not evaluated. A CSS framework would add install time and bundle weight for no scoring benefit. A single `index.css` file keeps the build simple and is easy for a reviewer to read without knowing Tailwind class names.

### 4. `TagOperationResult` uses `Pick<Customer, ...>` for the mutation return type

The mutation only returns a subset of customer fields. Rather than reusing the full `Customer` interface, the frontend type precisely reflects what the query actually fetches. This keeps the compiler honest — it will fail if the query is changed to return fewer fields without updating the type.

---

## What's incomplete

- **Frontend tests** — There are no unit or integration tests in this repo. With more time I'd add at minimum: (1) a test for `FilterForm` verifying that empty fields produce `null` criteria, and (2) a test for `TagPanel` that mocks Apollo and checks the empty-tag inline error appears before any mutation fires.
- **Pagination** — The backend caps `filterCustomers` at 50 results. The table has no pagination UI; all matched results render at once.
- **Optimistic UI** — After applying a tag, the app waits for a full `filterCustomers` refetch before updating the table. Optimistic Apollo cache writes would make the tag badges update instantly.
- **Environment validation** — If `VITE_GRAPHQL_URL` is missing or wrong, the error surfaces as a network error at runtime rather than a clear startup warning.

---

## What I'd do with another day

1. **Frontend tests** — the most important gap. Focused tests on `TagPanel` (empty-tag validation, dry-run → confirm flow) would give a reviewer real confidence in the logic without having to run the app.
2. **Pagination** — Add cursor-based pagination to the results table, wired to a `first` / `after` argument on the backend query.
3. **Saved filters** — A sidebar where the user can name and bookmark a filter set. `localStorage` on the frontend, no backend change needed.
4. **Error boundary** — Wrap the app body so an uncaught render error shows a friendly message instead of a blank screen.

---

## Assumptions

- The backend's single `applyCustomerTag` mutation (with a `TagAction` enum) is the intended API. The brief mentioned separate `tagsAdd` / `tagsRemove` mutations, but the provided backend uses a unified mutation — the frontend is wired to what the API actually exposes.
- Currency is always USD in the fixture data. The `Intl.NumberFormat` call reads `currencyCode` from the API response, so it would handle other currencies correctly if the data changed.
- Tag names are case-sensitive, matching backend behaviour. `VIP` and `vip` are treated as different tags.
- The history panel only shows operations from the current server session. The backend stores history in memory and resets on server restart.

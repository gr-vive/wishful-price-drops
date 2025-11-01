Here’s a paste-ready **`TODO.md`** for your Lovable/React frontend. It bakes in your input modes, strict attribute normalisation, country handling, and a single tracking rule at creation.

---

# Smart Price Agent — Frontend TODO

> Goal: ship a rock-solid, demo-ready UI in **8 hours** that supports **Add by URL / Name / Name+Attributes**, enforces **country**, normalises **attributes**, and creates items with a **single tracking_rule**.

---

## 0) Project Setup

* [ ] Create Lovable project (React + TypeScript).
* [ ] Add `.env` with:

  * `VITE_API_BASE_URL=http://localhost:3000`
  * `VITE_DEMO_MODE=true` (optional default)
* [ ] Install deps:

  * UI: (Lovable defaults) + lightweight toast library if needed
  * Utility: `nanoid` (ids), `zod` (validation) — optional
* [ ] Create folders:

  ```
  src/components/
  src/pages/
  src/api/
  src/lib/
  src/types/
  src/state/
  ```
* [ ] Add global styles, CSS variables for success/error/info.
* [ ] Add a basic `ToastProvider` and `ErrorBoundary`.

---

## 1) Data Models (frontend)

`src/types/item.ts`

```ts
export type InputType = 'url' | 'name' | 'name+attrs';
export type Country = 'GB' | 'US' | 'EU';

export type NormalisedAttributes = {
  size?: string;     // e.g., "M", "256GB", "EU 42"
  color?: string;    // e.g., "black", "starlight"
  region?: string;   // e.g., "UK", "EU", "US"
  // extendable: material, model_year, etc.
};

export type TrackingRule =
  | { type: 'percentage_below_avg'; value: number } // e.g., 10 for -10%
  | { type: 'below_absolute'; currency: 'GBP'|'USD'|'EUR'; value: number };

export type ItemDTO = {
  id: string;
  title: string;                // required
  url?: string;                 // may be empty
  image?: string;
  domain: string;               // 'manual' if no url
  inputType: InputType;
  userCountry: Country;         // required
  attributes?: NormalisedAttributes;
  links: string[];              // can be empty
  currentPrice?: number;
  targetPrice?: number;         // derived if rule is absolute
  trackingRule: TrackingRule;   // single rule at creation
  status: 'TRACKING' | 'ALERTED' | 'ERROR';
  lastChecked?: string;         // ISO
  history?: Array<{ ts: string; price: number }>;
  skuKey?: string;              // derived from title+attrs+country
};
```

**SKU Key (frontend-derived)**

```ts
// skuKey = slug(title) + '|' + normalize(attrs) + '|' + userCountry
// Example: "iphone-15-pro-256gb|color:black|size:256gb|region:uk|GB"
```

---

## 2) API Client

`src/api/client.ts`

* [ ] `GET /items` → `ItemDTO[]`
* [ ] `POST /items` → create item
* [ ] `PATCH /items/:id` → update target/trackingRule
* [ ] `DELETE /items/:id`
* [ ] `POST /prices/refresh` → `{ updated: ItemDTO[] }`
* [ ] `POST /items/:id/simulate-drop` (demo)
* [ ] `POST /alerts/email` (optional)

**Policies**

* [ ] 6s timeout per request; on timeout show toast + suggest Demo Mode.
* [ ] Always send `X-Session-Id` from `localStorage` (generate once).

---

## 3) State & Persistence

`src/state/useItems.ts`

* [ ] `items`, `setItems`, `loading`, `lastFetchAt`, `demoMode`
* [ ] Mirror `items` to `localStorage` (`spa.items.v1`)
* [ ] Actions:

  * `addByUrl(payload)`
  * `addByName(payload)`
  * `addByNameAttrs(payload)`
  * `refreshPrices(ids?)`
  * `simulateDrop(id)`
  * `editTrackingRule(id, rule)` OR `editTargetPrice(id, value)`
  * `remove(id)`
  * `resetDemo()`

---

## 4) Attribute Normalisation

`src/lib/normalize.ts`

* **Rules**

  * [ ] Trim, lowercase, collapse spaces.
  * [ ] Map synonyms: `colour → color`, `grey→gray`, `starlight→starlight` (no change).
  * [ ] Sizes:

    * For storage: `256 GB`, `256gb`, `256` → `256GB`
    * For apparel: normalise to `S|M|L|XL|XXL`, EU/UK shoe sizes keep exact label (`EU 42`, `UK 8`)
  * [ ] Region:

    * “UK”, “United Kingdom”, “GB” → `UK`
    * “EU”, “Europe” → `EU`
* [ ] `normalizeAttributes(input): NormalisedAttributes`
* [ ] `buildSkuKey(title, attrs, country): string`

**Examples**

* Input: `title="iPhone 15 Pro 256 GB", color="Black", size="256 gb", region="United Kingdom", country="GB"`
* Output:

  * `attributes: { color: "black", size: "256GB", region: "UK" }`
  * `skuKey: "iphone-15-pro-256gb|color:black|size:256gb|region:uk|GB"`

---

## 5) Input Modes UI

### 5.1 AddItemDialog (`src/components/AddItemDialog.tsx`)

* [ ] Tabs: **URL**, **Name**, **Name + Attributes**
* [ ] Common required field: **Title**
* [ ] Country select (**required**): `GB | US | EU`
* [ ] Links: optional textarea; parse by newline/space; de-dupe.
* [ ] Tracking Rule (single):

  * Radio:

    * `-10% from average` (default)
    * `Below X GBP` (show numeric input + currency)
* [ ] Validations:

  * Title: non-empty, length ≤ 120
  * URL mode: basic `https?://` validation for `url`
  * Name modes: no url required
  * Attributes mode: if provided, normalise strictly
  * Country required always
* [ ] Submit payload mapping (see §6)

**Test IDs**

* `dialog-add-item`
* `tab-url`, `tab-name`, `tab-name-attrs`
* `input-title`, `input-url`, `select-country`
* `input-links`, `attrs-size`, `attrs-color`, `attrs-region`
* `rule-percent`, `rule-absolute`, `input-absolute-value`
* `btn-submit-url`, `btn-submit-name`, `btn-submit-nameattrs`

### 5.2 Toolbar (`src/components/Toolbar.tsx`)

* [ ] Buttons: `Add`, `Refresh Prices`, `Add Demo Items`
* [ ] Sort: `date | price | pctChange`
* [ ] Toggle: `Demo Mode`
* Test IDs: `btn-add-item`, `btn-refresh`, `btn-add-demo`, `select-sort`, `toggle-demo`

### 5.3 Wishlist & ItemCard

* [ ] Columns/cards: image, title, domain, current price, tracking rule/target, status, last checked
* [ ] Inline edit for absolute rule value (if that mode is selected)
* [ ] “Simulate drop” (visible in demo mode)
* Test IDs (per-card): `item-card-{id}`, `item-title`, `item-domain`, `item-current-price`, `item-target-price`, `badge-alerted`, `btn-simulate-drop`

### 5.4 ItemDetailsDrawer

* [ ] Show: title, url link, domain, country, attributes (normalised), skuKey
* [ ] History sparkline placeholder (or “No history yet”)
* [ ] Edit tracking rule (radio + input)
* [ ] Save & close
* Test IDs: `drawer-item-details`, `details-last-checked`, `details-history`, `input-target-inline`, `btn-save-target`

### 5.5 EmptyState

* [ ] Copy: “Start tracking prices. Add a link or a product name.”
* [ ] Buttons: “Add demo items”, “Add item”
* Test IDs: `empty-state`, `btn-empty-add-demo`, `btn-empty-add-item`

### 5.6 SettingsModal (optional)

* [ ] Country & currency defaults, reset demo data
* Test IDs: `modal-settings`, `select-country`, `select-currency`, `btn-reset-demo`

### 5.7 DebugPanel (only in Demo Mode)

* [ ] Show: API base, last fetch time, item count
* Test IDs: `debug-panel`, `debug-last-fetch`, `debug-api-base`

---

## 6) Create Item — Payload Mapping

**Frontend builds one of these based on tab selection:**

### URL Mode

```ts
{
  title: string;                       // required
  input_type: 'url';
  user_country: Country;               // required
  url: string;                         // required
  links: string[];                     // can be empty
  attributes?: NormalisedAttributes;   // optional, if user set
  tracking_rule: TrackingRule;         // required (single)
  skuKey: string;                      // computed client-side
}
```

### Name Mode

```ts
{
  title: string;
  input_type: 'name';
  user_country: Country;
  links: string[];                     // optional
  attributes?: NormalisedAttributes;   // optional
  tracking_rule: TrackingRule;
  skuKey: string;
}
```

### Name + Attributes Mode

```ts
{
  title: string;
  input_type: 'name+attrs';
  user_country: Country;
  attributes: NormalisedAttributes;    // strongly encouraged here
  links: string[];                     // optional
  tracking_rule: TrackingRule;
  skuKey: string;
}
```

**Tracking Rule UI → Model**

* Radio = “−10% from average” → `{ type: 'percentage_below_avg', value: 10 }`
* Radio = “Below X GBP” → `{ type: 'below_absolute', currency: 'GBP', value: X }`

  * Auto-switch currency label based on selected country.

---

## 7) Demo Data & Flows

* [ ] “Add Demo Items” seeds 2–3 entries:

  * BooksToScrape URL (static price)
  * eBay product URL (if allowed) or second BooksToScrape URL
  * One “name+attrs” item (e.g., “iPhone 15 Pro 256GB”, color black, region UK)
* [ ] For at least one item, set rule `below_absolute` just above `currentPrice` so the alert will trigger after refresh or simulate.
* [ ] `simulateDrop(id)` lowers `currentPrice` to 95% of absolute threshold and sets status `ALERTED`.

---

## 8) Validation Rules (user-visible)

* Title: required for all modes.
* Country: required for all modes.
* URL mode: URL required and must start with `http://` or `https://`.
* Attributes:

  * If provided, normalise; empty strings are treated as `undefined`.
  * Show helper text: “Attributes help avoid mixing SKUs (e.g., storage size/color/region).”
* Tracking rule:

  * One rule only on create.
  * `below_absolute`: numeric > 0
  * `percentage_below_avg`: 1–90 (clamp to avoid nonsense)

---

## 9) Error, Loading & Empty States

* [ ] Skeleton cards while creating/refreshing.
* [ ] Per-item error chip + “Retry” button.
* [ ] Global toast for network errors.
* [ ] Offer **“Switch to Demo Mode”** if API fails twice in a row.

---

## 10) Accessibility

* [ ] Labels for all inputs; `aria-live="polite"` for toasts/alerts.
* [ ] Keyboard focus on dialog open, trap focus inside dialog.
* [ ] Color + iconography for price up/down/same (not color only).

---

## 11) Performance Targets

* First paint ≤ 1.5s locally.
* Add item → visible card ≤ 2s (use optimistic row with “Loading…”).
* Bundle < 300KB gzipped (avoid heavy chart libs; use simple SVG sparkline if any).

---

## 12) Observability

* [ ] `console.info` on: add item, refresh prices, simulate drop, rule edit.
* [ ] DebugPanel shows `lastFetchAt` timestamp.
* [ ] Add `data-testid` from the checklist for quick e2e sanity.

---

## 13) Test Script (manual, 5 minutes)

1. Load app → see **EmptyState**.
2. Click **Add Demo Items** → cards appear.
3. Click **Refresh Prices** → per-card loaders → updated prices.
4. Open first item → **ItemDetailsDrawer** shows attrs, skuKey, country.
5. Edit rule to `Below X GBP` → save → target price changes on card.
6. Toggle **Demo Mode** → press **Simulate Drop** → item shows `ALERTED` + banner.
7. Add new item via **URL** with title → card appears with domain & status.
8. Add new item via **Name + Attributes** (iPhone example) → verify normalised attrs in drawer.

---

## 14) Out of Scope (today)

* Social imports (Pinterest/TikTok/IG)
* Email inbox parsing UI
* Telegram/WhatsApp push
* Payments
* Complex charts/AI explanations

Mention these on the final slide as **Next steps**.

---

## 15) Quick UX Copy (paste into components)

* Empty: “Start tracking prices. Add a link or a product name.”
* Attributes help: “Add size, color, and region to avoid mixing SKUs.”
* Country hint: “Prices are tracked per country. Choose where you shop.”
* Rule labels:

  * “Alert me when price is **10% below** the average”
  * “Alert me when price is **below**”
* Demo banner: “Demo Mode is on — prices and alerts may be simulated.”

---

## 16) Nice-to-Have (time permitting)

* Sort by `% vs avg` (if backend provides)
* Copy link to product page from card menu
* Dark mode toggle

---

### Done well when…

* A judge can: add an item (URL or name), see it tracked for **their country**, confirm **normalised attributes**, trigger/see an **alert**, and understand the **single tracking rule** — all in under **60 seconds**.


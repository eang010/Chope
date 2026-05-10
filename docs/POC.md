# Chope & Take — POC application overview

## Purpose and positioning

**Chope & Take** is an internal-style **proof of concept** for an agency platform to share **pre-loved items** and **surplus food**, reduce waste, and surface **“chopes”** (soft reservations) on listings. The POC demonstrates **finder** and **giver** journeys, **multi-slot listings**, and **lightweight activity** signals—without real authentication, email, or a backend API.

---

## POC scope

| In scope | Out of scope (typical next phase) |
|----------|-----------------------------------|
| Full client-side UI flows | Real user accounts, passwords, magic links |
| In-memory / seed **mock listings** and **chopes** (Zustand) | Server persistence, sync, audit logs |
| **Two fixed tester personas** + account switcher | Production identity provider |
| PWA shell (manifest, standalone, icons) | Push notifications, transactional email |
| Service worker registration (when enabled) | Full offline data strategy |

---

## Feature list

### Onboarding and shell

- **Welcome** — Value proposition, **Get Started**, and a **POC account switcher** (collapsible, under the primary CTA) to pick a tester persona before or after entering flows.
- **Role select** — Choose **Finder** vs **Giver** (sets role in store and routes into the right flow).
- **Bottom navigation** (hidden on welcome / role select) — **Home**, **Browse**, **List**, **Activity**, **Profile**; respects **safe-area** insets.
- **Urgent banner** — Fixed top strip when at least one **urgent** listing qualifies: `isUrgent`, not **archived**, and **remaining slots** > 0 (see `listUrgentBannerCandidates` in `lib/store.ts`, stable **listings array order**). The strip shows **one featured urgent at a time** (`urgentFeaturedId` in the store). **Dismiss (X)** clears the strip for the session (`urgentFeaturedId` → `null`) until store logic surfaces a featured id again (e.g. after **release chope**). **Snag It Now** sets role to Finder, ensures that listing’s **category** is selected, opens **Browse**, then dismisses the banner. **More / Less** toggles description and location-style detail. With **multiple** qualifying urgents: **dot controls** on the **same row** as the action buttons jump to a listing by index; a horizontal **swipe** (touch, past a small threshold) cycles **previous / next** candidate in that same order. **Live region** on the title updates when the featured listing changes.
- **POC dock switcher** (non-welcome screens) — Collapsible **top-right** control; stacks **below** the urgent banner in z-order so the banner stays dismissible; collapses after choosing a user.

### Finder

Finder is a **two-step flow**: (1) **select categories**, then (2) **browse** listings.

- **Categories** — Multi-select **categories** (`food`, `merch`, `electronics`, `open-jio`, `other`); continues to browse with carousel index reset.
- **Browse** — Horizontal **carousel** of listings filtered by category, availability, non-archived, and **remaining slots**; keyboard navigation; **listing position** in the deck (`N of M`) in the header (no step progress bar on this screen).
- **Chope** — Optional message; **at most one chope per session user per listing**; respects listing **quantity** / slots used.
- **Empty / end-of-deck states** — Change categories, replay the carousel, or open **My chopes**.

### Giver (create listing)

- **Five-step flow** with a shared **progress tracker** (dots + connectors): **Photos → Details → Availability → Location → Preview** (step 5 of 5), then **Success** (success screen is not part of the step tracker).
- **Details** — Title, description, category, **urgent** flag, **quantity** (how many finders can chope).
- **Availability** — Available from / until (with urgent-specific messaging where relevant).
- **Location** — Preset locations and custom entry.
- **Preview** — Card-style preview; publish assigns **owner** fields from the **active POC session user**.
- **Success** — Confirmation after publish.

### Profile and ownership (session-scoped)

- **My listings** — Listings where `ownerId` matches `sessionUserId`; session hint; **New** listing; **edit** when the listing has no chopes; **archive** and **revive** (revive clears chopes for that listing and applies a new quantity per store logic).
- **My chopes** — Chopes where `requesterId` matches `sessionUserId`; **release** chope (only as that user), which frees a slot for finders.

### Activity signal

- **Activity tab badge** — Count of **chopes on listings you own** (current session as giver), with a capped display (e.g. `9+`).

---

## Data model (conceptual)

- **Listing** — Category, images, location, availability window, **owner** identity fields, **urgent** flag, **status**, **quantity**, **archived**, and related metadata.
- **Chope** — Links `listingId` to **requester** id, display name, department, optional message, and timestamp; drives **slots used** and **remaining** capacity.
- **Session user** — `sessionUserId` in Zustand, bound to **POC users** (`lib/poc-users.ts`: e.g. **tester-a** / **tester-b**). Drives chope **requester** identity, **release** permission, **owner** on newly published listings, filters for **My listings** / **My chopes**, and the **Activity** badge.
- **Urgent banner (store)** — `urgentFeaturedId: string | null` points at the listing id shown in the strip (or `null` when dismissed or there are no candidates). Helpers/actions include `listUrgentBannerCandidates`, `goNextUrgentBanner` / `goPrevUrgentBanner` (wrap when several qualify), `setUrgentFeaturedBannerIndex` (dot selection), and `dismissUrgentBanner`. Listing/chope mutations **re-sync** the featured id when it falls out of eligibility (e.g. last slot filled, archive, edit that removes urgency); **publishing a new urgent** at the front of the list focuses that listing; **reviving** an urgent listing can focus it when it becomes eligible again.

---

## Design and UX considerations

- **Mobile-first shell** — Full viewport height, safe-area padding on main content and bottom navigation; fixed chrome accounts for notches and the home indicator.
- **Brand and theme** — Green-forward palette (OKLCH tokens in `app/globals.css`); web manifest **theme_color** aligned with accent usage.
- **Step progress** — **Text-free** horizontal stepper on the **giver** flow only: solid primary **connectors only after completed steps** (so step 1 shows the first dot with no primary line yet; lines fill as you advance). Completed dots are solid primary; current step has a soft primary **ring**; upcoming steps are **hollow** outlines. No per-step captions; `aria-label` uses `Step X of N`. Finder **categories** and **browse** omit the stepper.
- **POC vs production** — Account switcher is explicitly labeled **POC** so testers do not confuse it with real login; placement balances visibility with not blocking urgent banner actions.
- **Iconography** — Favicon and PWA icon use the **leaf** motif aligned with the welcome screen; SVG supports light/dark preference where defined in `public/icon.svg`.
- **Accessibility** — Carousel region labeling, dialog patterns for chope confirmation, progress tracker semantics, and urgent banner **tablist** / **aria-selected** on dots plus **`aria-live="polite"`** on the featured title when it changes.

---

## Technical stack (high level)

- **Next.js** (App Router), **React**, **TypeScript**
- **Zustand** global client store (`lib/store.ts`) for routing, listings, chopes, session user, categories, draft listing, and **urgent banner** state (`urgentFeaturedId` plus candidate sync; exported `listUrgentBannerCandidates` for the same predicate the UI uses)
- **Tailwind CSS** and **shadcn/ui** (Radix primitives)
- **PWA** — `app/manifest.ts` (`standalone`, `short_name: Chope`, icons); root layout metadata for **Apple web app** and icons
- **Vercel Analytics** — Included in production builds via root layout

---

## Known limitations and test notes

- **No persistence by default** — A full reload typically resets to initial store state (mock data and default session user) unless persistence is added later.
- **Chope semantics** — **Terminal** reservation in-app (no accept/reject workflow); pickup coordination is assumed **offline**.
- **Mixed mock owners** — Seed listings use **tester-a** / **tester-b** and other mock `ownerId` values so flows can be validated across personas (e.g. chope as B on a listing owned by A).
- **Multiple urgent seed rows** — Mock data includes more than one **urgent** listing with remaining capacity so the **dot strip** and **swipe** rotation can be exercised without editing seed data.
- **`listing-requests` screen** — Declared on the store’s screen union but **not** wired in the main app shell switch; unknown screen values fall back to the welcome screen.

---

## Suggested demo script

1. Choose **tester A** on the welcome screen; enter as **Finder** → pick categories → **browse** → **chope** a listing owned by another persona where seed data allows it.
2. Switch to **tester B**; compare **My listings**, **Activity** badge, and **My chopes** to show owner vs finder perspectives.
3. As **Giver**, walk through publish and confirm **owner** fields match the active POC user.
4. Surface **urgent** listings: use the **urgent banner** (dismiss, expand, **Snag It** into browse). If several urgents qualify, show **dots** and **swipe** to change the featured listing, then dismiss and use **release chope** (or other listing edits) to confirm the strip and featured id stay consistent.
5. From **My chopes**, **release** a chope and show that finder capacity returns (remaining slots).

---

## Key files (reference)

| Area | Location |
|------|----------|
| Global state | `lib/store.ts` |
| POC personas | `lib/poc-users.ts` |
| App shell, nav, banner, switcher | `components/share-space-app.tsx`, `components/bottom-nav.tsx`, `components/urgent-banner.tsx`, `components/poc-account-switcher.tsx` |
| Step progress UI | `components/flow-progress-tracker.tsx` |
| PWA manifest | `app/manifest.ts` |
| Icons | `public/icon.svg`, metadata in `app/layout.tsx` |

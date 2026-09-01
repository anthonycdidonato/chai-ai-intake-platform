# CHAI AI Intake — session persistence backend (reference)

The public GitHub Pages build of the platform stores intake sessions in the
browser (IndexedDB), so the prototype works with no server and nothing leaves
the member's device. Inside the CHAI Member Portal the same sessions need to
live in a shared database, so that an organization's colleagues and CHAI
administrators can review and reference them.

This is that backend, kept deliberately small: Express + SQLite, one table for
the session document plus two denormalized tables (evidence manifest and
per-modifier results) that CHAI can report on.

## Run

```bash
cd server
npm install
npm start          # http://localhost:8787
```

Then point the frontend at it:

```bash
VITE_API_BASE_URL=http://localhost:8787 npm run dev
```

The frontend's `src/lib/store.ts` switches from IndexedDB to REST automatically
when `VITE_API_BASE_URL` is set — no other code changes.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/sessions` | Sessions for the caller's organization (all, for admins) |
| `GET` | `/sessions/:id` | One session |
| `PUT` | `/sessions/:id` | Create or update a session (the frontend autosaves here) |
| `DELETE` | `/sessions/:id` | Delete a session |
| `GET` | `/admin/modifier-stats` | Which modifiers most often land High or need more info |
| `GET` | `/health` | Liveness |

## Authorization

The Member Portal is the authentication boundary. This reference implementation
reads two headers and trusts them:

- `x-chai-org` — the caller's organization; scopes list and read access
- `x-chai-admin: true` — CHAI administrator; sees every organization

**Replace this with the portal's real session before deploying anywhere real.**
Also note that only the evidence *manifest* is stored — file names, types, sizes,
and which package each document was filed under. Storing the documents
themselves means a PHI-capable store, which is a portal infrastructure decision
rather than something this prototype should presume.

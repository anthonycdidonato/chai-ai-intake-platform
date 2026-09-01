# CHAI AI Intake Platform

A prototype for the **CHAI Member Portal**. A technology vendor or healthcare
delivery organization describes an AI use case, uploads whatever evidence it
has, and receives a suggested risk categorization — at the overall AI solution
level and at each individual risk modifier level — using CHAI's **Risk
Categorization Tool (v3)**.

**Live site:** https://anthonycdidonato.github.io/chai-ai-intake-platform/

> All information — use case description, evidence, and risk — is private to the
> submitting organization's colleagues in CHAI's member portal and CHAI
> administrators.

## The workflow

1. **Overview** — the landing page explains what the platform does and the
   privacy boundary.
2. **Describe & upload** — use case description plus evidence, filed under the
   13 CHAI evidence packages (core, low, medium, and high tier) and their
   evidence examples.
3. **Generate Risk Categorization** — all 19 risk modifiers across *Life &
   Patient Safety* (9) and *Technology & Data* (10) are categorized Low, Medium,
   or High. Anything the evidence cannot answer is flagged **Needs More
   Information**.
4. **Fill the gaps in place** — every flagged modifier names the exact evidence
   packages that would resolve it, with an uploader right there on the card. The
   categorization recalculates the moment a file lands, and open items drop.
5. **Review & weight** — override any suggestion, and set a weight from 0
   (exclude) to 3 (triple) on each modifier. The domain and overall figures, and
   each modifier's share of the overall score, update in real time.
6. **Accept** — record the final determination, who accepted it, and why.
7. **Download & share** — JSON export, PDF via the browser's print dialog, or an
   email to colleagues.
8. **More to come** — a closing panel previewing the next component: mitigation
   controls (operational and contractual at the use case level, governance at the
   organizational level) triggered by risk at both the overall and modifier level.

Every session is saved automatically and listed under **Saved sessions**.

## How risk is determined

Two figures are always reported side by side, because the source tool is
explicit that it *does not* produce a single risk score:

| Figure | How it is computed | Affected by weights? |
| --- | --- | --- |
| **CHAI level** | The highest modifier response present. Any High modifier means a detailed risk assessment (hazard, harm, probability) is strongly recommended. | No |
| **Weighted composite** | Weighted mean of modifier levels (Low=1, Medium=2, High=3), banded at 1.67 and 2.33. `N/A` and `Needs More Information` are excluded. | Yes |

The platform recommends the more conservative of the two, so weighting can never
average a High modifier away. The final determination is the member's to make.

### Why a modifier got the level it got

The categorization engine is rules-based and fully inspectable — no black box,
nothing leaves the browser. For each modifier, in order:

1. A **member override**, if one is set.
2. A **phrase match** in the use case description against that modifier's Low /
   Medium / High signal lists (High checked first).
3. The **evidence ladder** — when the description is silent, the level implied by
   how complete the evidence for that modifier is.
4. A **precautionary fallback**, clearly labeled as a default.

If neither a phrase nor any informing evidence is present, the modifier is
flagged **Needs More Information** and names the packages that would resolve it.
Every card shows its rationale, its confidence, and the evidence behind it.

The mapping lives in [`src/data/inferenceModel.ts`](src/data/inferenceModel.ts) —
one entry per modifier — and is the file to edit when tuning the engine.

## Stack & layout

React + TypeScript + Vite, no runtime dependencies beyond React.

```
src/
  data/
    riskData.ts         all 19 risk modifiers and their Low/Medium/High definitions
    evidencePackages.ts the 13 evidence packages and their evidence examples
    inferenceModel.ts   evidence → modifier mapping and phrase signals
  lib/
    inference.ts        categorization engine
    scoring.ts          weights → domain and overall risk
    store.ts            session persistence (IndexedDB, or REST when configured)
    report.ts           JSON export, email share, printable report
  components/           Landing, IntakeForm, EvidenceUploader, ModifierCard,
                        ResultsReview, ReportView, MoreToCome, SessionsConsole
server/                 reference persistence backend (Express + SQLite)
```

## Session persistence

Sessions are saved automatically as you work. The store has two adapters and the
application code is identical either way:

- **IndexedDB** (default) — what the public GitHub Pages build uses. No server,
  so nothing leaves the member's device.
- **REST** — set `VITE_API_BASE_URL` and the same calls go to
  [`server/`](server/README.md), an Express + SQLite reference backend that
  writes to a shared database, scoped by organization, with full access for CHAI
  administrators. It also keeps a denormalized evidence manifest and
  per-modifier results table so CHAI can report on which modifiers most often
  come back High or need more information.

```bash
cd server && npm install && npm start        # http://localhost:8787
VITE_API_BASE_URL=http://localhost:8787 npm run dev
```

Only the evidence **manifest** is recorded — file names, types, sizes, and the
package each document was filed under. Storing the documents themselves requires
a PHI-capable store, which is a Member Portal infrastructure decision rather
than something a prototype should presume.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
```

## Deploy

Push to `main`; GitHub Actions builds and publishes to Pages
(`.github/workflows/deploy.yml`). Vite's `base` is `/chai-ai-intake-platform/`
and must match the repository name.

## Source

Risk domains, risk modifiers, and their Low / Medium / High definitions are
transcribed from the Coalition for Health AI (CHAI) *Risk Categorization Tool*
User Guide (v3), pages 10–11. Evidence packages and evidence examples come from
CHAI's evidence-package matrix. Branding follows the CHAI color specification:
Dark Blue `#003E56`, Medium Blue `#006689`, Light Blue `#9ED4E5`, Green
`#6C9B35`, Red `#D91F26`, Orange `#FF9933`, Yellow `#FFD880`.

This is a prototype for internal CHAI review, not a certified assessment tool.
If your AI solution qualifies as Software as a Medical Device (SaMD), follow FDA
regulations and guidance.

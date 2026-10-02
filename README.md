# CHAI AI Intake Platform

A prototype for the CHAI Member Portal. It answers the two questions a health
system actually has when a vendor hands over a stack of documentation:

1. **Based on the documentation I received, how should I categorize this
   solution's risk?**
2. **Given that categorization, which risk mitigations should I consider
   implementing?**

**Live:** https://anthonycdidonato.github.io/chai-ai-intake-platform/

## The workflow

| Step | What happens |
| --- | --- |
| **Describe** | Name the vendor and solution, describe the use case, and record which of CHAI's 13 evidence packages the vendor has given you. |
| **Categorize** | The platform suggests a level for each of the 19 risk modifiers and for the solution overall, explains *why* in plain language, and says plainly where the documentation can't answer the question. You confirm or change each one. |
| **Mitigate** | The mitigation controls your confirmed risk profile calls for, each naming the modifier and level that triggered it. |
| **Report** | The whole review — categorization and controls — as JSON or a printable PDF. |

Documents are **recorded, not uploaded**. The categorization depends only on
*which* evidence packages you hold, never on their contents, so nothing you
enter leaves the browser.

## How risk is categorized

Each of the 19 modifiers is categorized independently from two signals:

- **Phrases in your use case description** — matched against the Low/Medium/High
  definitions in the source tool (`src/data/inferenceModel.ts`).
- **The evidence packages on file** — when the description is silent, an
  evidence ladder infers a level from how complete the documentation is.

A modifier neither signal can answer is flagged **Needs more information**, and
names the exact packages that would resolve it. You can record one right there
on the modifier and watch the categorization update.

Overall and domain risk are the **highest modifier present** — the source tool
does not produce a single score, and one High modifier is enough to warrant a
detailed risk assessment, so nothing is averaged away.

## How mitigations are triggered

A control fires when **any risk modifier it maps to is confirmed at a level the
control applies at**. Every control shows the modifiers and levels that pulled
it in, so the list is reviewable rather than a set of recommendations to take on
faith.

The library discriminates across profiles — a solution whose modifiers are all
Low pulls 20 of the 97 controls; all Medium pulls 66; all High pulls all 97.

## Source material

| Data | File | From |
| --- | --- | --- |
| 19 risk modifiers, Low/Medium/High definitions | `src/data/riskData.ts` | CHAI Risk Categorization Tool (v3) |
| 13 evidence packages and their examples | `src/data/evidencePackages.ts` | CHAI evidence-package matrix |
| 97 mitigation controls | `src/data/mitigations.ts` | CHAI Risk Mitigation Mapping workbook (v7, Oct 2026), *Mitigation Library* tab |
| Description → modifier mapping | `src/data/inferenceModel.ts` | Authored for this prototype |

The mitigation library carries four columns from the workbook — **B** Mitigation,
**D** Risk Level Applied, **G** Description — plus **E** Domain(s) and **F** Mapped
risk modifiers, which are used for routing only and never shown as their own
field. Modifier codes map `LPS01–09 → life-01..09` and `TD01–10 → tech-01..10`.

## Development

```bash
npm install
npm run dev -- --port 5179
npm run build
```

Push to `main` to deploy — GitHub Actions builds and publishes to Pages.

## Scope

This is a prototype for discussion, not a system of record. The determination is
the reviewing organization's to make, not CHAI's.

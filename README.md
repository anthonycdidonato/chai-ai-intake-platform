# CHAI AI Intake Platform

Three steps to answer one question about an AI solution — third-party or built in-house:
**is it safe to bring in, and what do we need to put in place?**

**Live:** https://anthonycdidonato.github.io/chai-ai-intake-platform/

| Step | What happens |
| --- | --- |
| **1 · Intake** | Describe the solution and upload any documentation. Say what each document is (CHAI's document types are offered as a reference, not a checklist). Files are described, never transmitted. |
| **2 · Risk levels** | For each of the 19 CHAI risk modifiers, a level is suggested and pre-selected **only where the uploaded documentation supports one**. Modifiers with insufficient evidence are flagged with the exact documents to request. Confirm and submit. |
| **3 · Mitigations** | For each modifier and its selected level, the mitigations the CHAI library maps to it — name and description. Download as PDF or JSON, or email a summary to your team. |

Progress saves in the browser (**Save for later** in the header, or just come back).

## Rules the engine follows

- **Evidence decides sufficiency.** A modifier is suggested only if at least one document type that answers it was uploaded. The description refines the level; it never substitutes for a document.
- **Overall risk is the highest selected modifier.** The CHAI tool does not average — one High warrants a detailed risk assessment.
- **A mitigation is listed under a modifier when the library maps it to that modifier at the selected level.**

## Source data

| Data | File | From |
| --- | --- | --- |
| 19 risk modifiers and definitions | `src/data/riskData.ts` | CHAI Risk Categorization Tool (v3) |
| 13 document types | `src/data/evidencePackages.ts` | CHAI AI Intake evidence packages |
| 97 mitigations | `src/data/mitigations.ts` | CHAI Risk Mitigation Mapping workbook (v7, Oct 2026), *Mitigation Library* tab — columns B, D, G as content; E, F for mapping only |
| Document → modifier mapping and description signals | `src/data/inferenceModel.ts` | Authored for this prototype — **edit here to tune suggestions** |

## Development

```bash
npm install
npm run dev -- --port 5179
npm run build
```

Push to `main` to deploy via GitHub Actions → Pages.

Prototype for discussion, not a system of record. The determination is the reviewing organization's to make.

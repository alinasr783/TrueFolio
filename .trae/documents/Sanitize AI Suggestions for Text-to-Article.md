## Goals
- SEO Keywords: always generated in English, clean, human-readable, comma‑separated (no JSON artifacts or quotes/brackets), deduplicated.
- Title: sanitized to remove surrounding quotes and smart quotes before display/save.
- Source Material: concise English text derived from project `details` when a project is selected; auto-populate the input immediately.

## Changes to Implement
- Prompt updates for AI suggestions (business details → suggestions):
  - Enforce English output and strict JSON schema: `{ keywords: string[], source_text: string }`.
  - Constraints: keywords ≤ 12, no brand names unless present in `details`, avoid special characters; `source_text` 150–300 words, English only.
- Sanitization utilities:
  - `sanitizeKeywords(raw: string | string[])`: normalize to English comma‑separated list; strip quotes/brackets/backticks, collapse whitespace, deduplicate case‑insensitive, limit to 12 items.
  - `sanitizeTitle(raw: string)`: trim, remove surrounding quotes/smart quotes and stray punctuation.
- Auto-fill on project selection:
  - When `selectedProjectId` changes and `project.details` exists, call the AI suggestion automatically and set:
    - `keywordsInput = sanitizeKeywords(ai.keywords)` (English).
    - `sourceType = 'text'`, `sourceText = ai.source_text` (English).
    - `articleType`/`articleGoal` remain user-selectable and are included in prompt.
- Title generation flow:
  - After `generateTitles`, sanitize both `title_en` and `title_ar` via `sanitizeTitle` before setting `titleEn`, `titleAr`, and `title`.
  - Fallback path also runs sanitization.
- UI feedback:
  - Add small helper text under SEO field: "AI suggested in English; edit freely".
  - Keep manual override: user can edit keywords/source after auto-fill.

## Implementation Steps
1. Update `aiSuggestFromDetails` prompt to require English and strict JSON; fallback parser cleans lines → keywords.
2. Add `sanitizeKeywords` and `sanitizeTitle` functions to `Tool_TextToArticle.jsx`.
3. On `selectedProject` change, if `details` present and not yet suggested for this project, trigger `aiSuggestFromDetails` and auto‑populate fields; set `sourceType = 'text'`.
4. In `generateTitles` consumer code, run `sanitizeTitle` on all derived titles.
5. Ensure `buildPrompt` already enforces English (keep as is); confirm `generateArticle` uses `englishTone` but not adding quotes.

## Validation
- Select a project with Arabic or mixed details; SEO Keywords should appear in English and clean comma‑separated (no brackets/quotes). Source Material shows concise English summary.
- Run `Generate Article`; confirm title field does not include quotes and keywords remain unchanged.
- Verify that manual edits to keywords/source are respected (no auto‑overwrite unless project changes again).

## Rollback & Safety
- All changes are local to `Tool_TextToArticle.jsx` and non‑breaking; if AI fails, fallback still produces English‑normalized keywords from raw lines.
- No changes to database schema; only reads `project.details` already added to select.

## Next Enhancements (optional)
- Expose a language toggle for keywords (English/Arabic) if needed later.
- Add industry presets affecting keyword generation (e.g., ecommerce, fintech).

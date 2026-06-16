# Constants (`@/constants`)

Domain-organized app constants (no mock data folder).

```
constants/
  config/       env (API URL)
  ui/           tokens, typography
  filters/      teacher filters, subjects
  teacher/      empty profile defaults, gender options
  communities/  UI tabs/categories; lists filled via API
  legal/        privacy/terms/help copy
  backgrounds/  mesh/polygon presets
```

Import from barrel: `import { FILTER_ALL, isApiEnabled } from '@/constants'`

## Skills & subjects — use the database, not mock lists

**Major (skill) and subject (sub_skill) options already live in the database.** Do not add or maintain hardcoded skill/subject lists for production UI.

| DB table     | UI label   | Columns |
|--------------|------------|---------|
| `skill`      | Major      | `skill_name` (English), `skill_name_kh` (Khmer) |
| `sub_skill`  | Subject    | `sub_skill_name` (English), `sub_skill_name_kh` (Khmer) |

Browse filters use **skill_id / sub_skill_id** as dropdown values (not free text) so EN/KH labels stay consistent.

### Provinces (`province` table)

| Column | Language |
|--------|----------|
| `province_name` | English (e.g. Takeo) |
| `province_name_kh` | Khmer (optional — if missing, UI falls back to `province_name`) |

- **API:** `GET /v1/mentors/provinces/listAll` → `fetchProvinces()`
- **Dropdowns:** `buildProvinceOptionObjects(provinces, lang)` — value stays English for save/API; label uses `province_name` or `province_name_kh` from DB
- Do **not** extend static `locationOptions` in `mentorFilters.js` for new provinces
- Do **not** add provinces to `kmOptionLabels.js` — Khmer comes from `province_name_kh`

### API (source of truth)

| Purpose | Endpoint | Service |
|---------|----------|---------|
| Full skill tree (majors + subjects) | `GET /v1/mentors/skill/listAllSkill` | `fetchAllSkills()` |
| Mentor’s saved skills | `GET /v1/mentors/:userId/skills` | `fetchMentorSkills(userId)` |

Optional query: `?lang=en` or `?lang=km` on `listAllSkill`.

### Frontend usage

- **Browse filters** — `useMentorFilterCatalog()` → `skillsCatalog` + `buildMentorFilterOptionSet()`
- **Dropdowns** (edit profile, onboarding, create post) — `buildSkillOptions(catalog, lang)`, `buildSubSkillOptions(catalog, skillId, lang)`
- **Display on cards/profiles** — `skillRowLabel(row, lang)` or `useLocalizedMentor(mentor)` (skill: `skill_name`; sub_skill: `sub_skill_name`)
- **Filter matching** — keep English `value` for query params; show localized `label` in the UI

### What *not* to do

- Do **not** extend `majorOptions` / `subjectOptions` in `filters/mentorFilters.js` for new majors or subjects.
- Do **not** add skills to `kmOptionLabels.js` for DB-driven names — Khmer comes from `skill_name_kh` / `sub_skill_name_kh`.
- Do **not** mock mentor `major` / `subject` / `subjects` on list or profile payloads.

### Static lists in `mentorFilters.js` (legacy only)

`majorOptions` and `subjectOptions` are **offline fallbacks** when `VITE_API_URL` is unset or the API fetch fails. They are not the product catalog. With the API enabled, `useMentorFilterCatalog` replaces them from the DB automatically.

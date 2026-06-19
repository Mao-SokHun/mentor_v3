/** True when row is from `sub_skill` table (not parent `skill`). */
export function isSubSkillRow(row) {
  if (!row) return false;
  return (
    row.sub_skill_id != null ||
    row.sub_skill_name != null ||
    row.sub_skill_name_kh != null
  );
}

/** Parent skill row — `skill` table columns only. */
export function skillRowLabel(row, lang = 'en') {
  if (!row) return '';
  const en = String(row.skill_name ?? row.name ?? '').trim();
  const kh = String(row.skill_name_kh ?? en).trim();
  if (lang === 'km' && kh) return kh;
  return en || kh;
}

/** Sub-skill row — `sub_skill` table columns (`sub_skill_name`, `sub_skill_name_kh`). */
export function subSkillRowLabel(row, lang = 'en') {
  if (!row) return '';
  const en = String(
    row.sub_skill_name ?? row.skill_name ?? row.name ?? '',
  ).trim();
  const kh = String(
    row.sub_skill_name_kh ?? row.skill_name_kh ?? en,
  ).trim();
  if (lang === 'km' && kh) return kh;
  return en || kh;
}

/** Auto-detect skill vs sub_skill row. */
export function catalogRowLabel(row, lang = 'en') {
  if (!row) return '';
  return isSubSkillRow(row) ? subSkillRowLabel(row, lang) : skillRowLabel(row, lang);
}

/** Columns on `skill` table. */
export const SKILL_ATTRS = ['skill_id', 'skill_name', 'skill_name_kh'];

/** Columns on `sub_skill` table — use sub_skill_name (not skill_name). */
export const SUB_SKILL_ATTRS = [
  'sub_skill_id',
  'skill_id',
  'sub_skill_name',
  'sub_skill_name_kh',
];

/** Columns on `province` table. */
export const PROVINCE_ATTRS = ['province_id', 'province_name', 'province_name_kh'];

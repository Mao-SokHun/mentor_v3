/** Resolve display label from skill/sub_skill row (skill_name = EN, skill_name_kh = KH). */
export function skillRowLabel(row, lang = 'en') {
  if (!row) return '';
  const en = String(row.skill_name ?? row.name ?? '').trim();
  const kh = String(row.skill_name_kh ?? en).trim();
  if (lang === 'km' && kh) return kh;
  return en || kh;
}

/** Columns that exist on skill / sub_skill tables — do not add skill_name_en (not in DB). */
export const SKILL_ATTRS = ['skill_id', 'skill_name', 'skill_name_kh'];
export const SUB_SKILL_ATTRS = ['sub_skill_id', 'skill_id', 'skill_name', 'skill_name_kh'];

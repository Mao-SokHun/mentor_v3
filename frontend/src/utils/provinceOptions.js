import { FILTER_ALL } from '@/constants'

/** EN = province_name; KH = province_name_kh from DB (no frontend translation map). */
export function provinceRowLabel(row, lang = 'en') {
  if (!row) return ''
  const en = String(row.province_name ?? row.name ?? '').trim()
  const kh = String(row.province_name_kh ?? '').trim()
  if (lang === 'km' && kh) return kh
  return en || kh
}

/** Province DB rows → select options (English value for save/API; localized label from DB). */
export function buildProvinceOptionObjects(provinces = [], lang = 'en') {
  return (provinces ?? [])
    .map((row) => {
      const value = String(row.province_name ?? row.name ?? '').trim()
      if (!value) return null
      return {
        value,
        label: provinceRowLabel(row, lang),
        provinceId: row.province_id ?? row.id ?? null,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Match stored address (EN/KH) → canonical English province_name for selects/API. */
export function resolveProvinceCanonicalName(provinceName, provinces = []) {
  const needle = String(provinceName ?? '').trim().toLowerCase()
  if (!needle) return ''

  const hit = (provinces ?? []).find((p) => {
    const en = String(p.province_name ?? p.name ?? '').trim().toLowerCase()
    const kh = String(p.province_name_kh ?? '').trim().toLowerCase()
    return en === needle || kh === needle
  })

  if (hit) return String(hit.province_name ?? hit.name ?? '').trim()
  return String(provinceName ?? '').trim()
}

/** Stored province string (EN or KH) → localized label using DB rows. */
export function resolveProvinceDisplayLabel(provinceName, provinces = [], lang = 'en') {
  const needle = String(provinceName ?? '').trim().toLowerCase()
  if (!needle) return ''

  const hit = (provinces ?? []).find((p) => {
    const en = String(p.province_name ?? p.name ?? '').trim().toLowerCase()
    const kh = String(p.province_name_kh ?? '').trim().toLowerCase()
    return en === needle || kh === needle
  })

  if (hit) return provinceRowLabel(hit, lang)
  return String(provinceName ?? '').trim()
}

/** Display province from API row or pre-localized string (never frontend-translated). */
export function displayProvinceLabel(source, lang = 'en') {
  if (!source) return ''
  if (typeof source === 'object' && (source.province_name != null || source.province_id != null)) {
    return provinceRowLabel(source, lang)
  }
  return String(source).trim()
}

/** Filter dropdown province list including "All Provinces". */
export function buildProvinceFilterOptionObjects(provinces = [], lang = 'en') {
  return [
    { value: FILTER_ALL.location, label: FILTER_ALL.location },
    ...buildProvinceOptionObjects(provinces, lang),
  ]
}

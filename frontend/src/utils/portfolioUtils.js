import {
  GitBranch,
  Share2,
  FileText,
  Globe,
  Award,
  ExternalLink,
  Users,
  Music2,
} from 'lucide-react'

/** @typedef {'github'|'linkedin'|'facebook'|'tiktok'|'drive'|'certificate'|'link'} PortfolioLinkKind */

export function portfolioHostname(link) {
  try {
    return new URL(String(link).trim()).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Classify URL for icon + default title suggestion. */
export function detectPortfolioLinkKind(link) {
  const host = portfolioHostname(link).toLowerCase()
  if (!host) return 'link'
  if (host.includes('github.com')) return 'github'
  if (host.includes('linkedin.com')) return 'linkedin'
  if (host.includes('facebook.com') || host.includes('fb.com')) return 'facebook'
  if (host.includes('tiktok.com')) return 'tiktok'
  if (host.includes('drive.google.com') || host.includes('docs.google.com')) return 'drive'
  if (/\.(pdf|doc|docx)$/i.test(link) || host.includes('certificate') || host.includes('credly')) {
    return 'certificate'
  }
  return 'link'
}

const KIND_META = {
  github: { Icon: GitBranch, color: 'text-slate-800 bg-slate-100' },
  linkedin: { Icon: Share2, color: 'text-sky-700 bg-sky-50' },
  facebook: { Icon: Users, color: 'text-blue-700 bg-blue-50' },
  tiktok: { Icon: Music2, color: 'text-slate-800 bg-slate-100' },
  drive: { Icon: FileText, color: 'text-amber-700 bg-amber-50' },
  certificate: { Icon: Award, color: 'text-violet-700 bg-violet-50' },
  link: { Icon: Globe, color: 'text-teal-700 bg-teal-50' },
}

export function portfolioKindMeta(kind) {
  return KIND_META[kind] ?? KIND_META.link
}

export function portfolioDisplayTitle(item) {
  const title = String(item?.title ?? '').trim()
  const link = String(item?.link ?? '').trim()
  if (title) return title
  const host = portfolioHostname(link)
  return host || link || ''
}

export function portfolioDisplaySubtitle(item) {
  const title = String(item?.title ?? '').trim()
  const link = String(item?.link ?? '').trim()
  const host = portfolioHostname(link)
  if (!host) return link
  if (title && host !== title) return host
  return link
}

export function suggestPortfolioTitle(link) {
  const kind = detectPortfolioLinkKind(link)
  const host = portfolioHostname(link)
  if (kind === 'github') return 'GitHub'
  if (kind === 'linkedin') return 'LinkedIn'
  if (kind === 'facebook') return 'Facebook'
  if (kind === 'tiktok') return 'TikTok'
  if (kind === 'drive') return host.includes('docs') ? 'Google Docs' : 'Google Drive'
  if (kind === 'certificate') return 'Certificate'
  return host || ''
}

export function normalizePortfolioItem(item) {
  return {
    id: item?.id ?? item?.link ?? `tmp-${Date.now()}`,
    link: String(item?.link ?? '').trim(),
    title: String(item?.title ?? '').trim(),
    oldLink: item?.oldLink || undefined,
  }
}

export function filledPortfolioItems(items = []) {
  return items
    .map(normalizePortfolioItem)
    .filter((item) => item.link || item.title)
}

export function validPortfolioItems(items = []) {
  return filledPortfolioItems(items).filter((item) => isValidPortfolioUrl(item.link))
}

export function isValidPortfolioUrl(link) {
  return /^https?:\/\/.+/i.test(String(link ?? '').trim())
}

/** UI bucket: external URL vs uploaded file portfolio row */
export function classifyPortfolioEntryMode(item) {
  const link = String(item?.link ?? '').trim()
  if (item?.entryMode === 'document' || item?.entryMode === 'link') return item.entryMode
  const hasFiles = (item?.files?.length ?? 0) > 0 || item?.pendingFile
  if (hasFiles) return 'document'
  if (link && /\/portfolio-files\/|\/uploads\/portfolio\//i.test(link)) return 'document'
  if (
    (item?.itemType === 'certificate' || item?.item_type === 'certificate') &&
    !isValidPortfolioUrl(link)
  ) {
    return 'document'
  }
  return 'link'
}

/** Rows with a non-empty link that fails URL validation. */
export function invalidPortfolioLinks(items = []) {
  return filledPortfolioItems(items).filter(
    (item) => item.link && !isValidPortfolioUrl(item.link)
  )
}

export function hasInvalidPortfolioLinks(items = []) {
  return invalidPortfolioLinks(items).length > 0
}

export { ExternalLink }

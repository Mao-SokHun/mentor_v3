import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  X,
  CheckCircle,
  Clock,
  MapPin,
  GraduationCap,
  Star,
  Mail,
  Banknote,
  ExternalLink,
} from 'lucide-react'
import clsx from 'clsx'
import Avatar from '@/components/ui/Avatar'
import { useTranslation, useLocalizedMentor } from '@/i18n'
import { contentFontClass, containsKhmerScript } from '@/utils/khmerTextUtils'
import { fetchMentorExperience, fetchMentorPortfolio, splitExperienceByType } from '@/services/mentors/mentorService'
import { resolveEducationForProfileView } from '@/utils/mentorOwnProfileUtils'
import { detectPortfolioLinkKind, portfolioKindMeta, portfolioDisplayTitle } from '@/utils/portfolioUtils'
import { isApiEnabled } from '@/constants'
import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'

const HONORIFIC = /^(dr|prof|mr|mrs|ms|assoc\.?\s*prof)\.?\s*$/i

function buildDisplayName(name, title) {
  const trimmedTitle = title?.trim() ?? ''
  if (!trimmedTitle) return name
  if (HONORIFIC.test(trimmedTitle) || trimmedTitle.length <= 4) {
    return `${trimmedTitle} ${name}`.trim()
  }
  return name
}

function formatEducationChip(row) {
  const role = String(row?.role ?? '').trim()
  const org = String(row?.org ?? '').trim()
  const year = String(row?.period ?? '').trim()
  const parts = [role, org, year].filter(Boolean)
  return parts.join(' · ')
}

function buildSpecialization(mentor) {
  if (!mentor) return ''
  const major = mentor.major ?? ''
  const subject = mentor.subject ?? ''
  const subjects = (mentor.subjects ?? []).filter(Boolean)

  if (major && subject) return `${major} & ${subject}`
  if (major) return major
  if (subject) return subject
  if (subjects.length) return subjects.slice(0, 2).join(' & ')
  return ''
}

function SectionLabel({ children, compactCaps }) {
  return (
    <h3
      className={clsx(
        'mb-2.5 text-[10px] font-bold tracking-[0.16em] text-slate-400',
        compactCaps && 'uppercase'
      )}
    >
      {children}
    </h3>
  )
}

function CredentialPill({ icon: Icon, label, value, compactCaps }) {
  if (!value) return null
  return (
    <div className="flex w-full items-start gap-2 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
      <p className="min-w-0 flex-1 text-xs leading-snug">
        <span
          className={clsx(
            'font-semibold text-slate-400',
            compactCaps && 'uppercase tracking-wide'
          )}
        >
          {label}:{' '}
        </span>
        <span className={clsx('font-medium text-slate-800 break-words', contentFontClass(value))}>
          {value}
        </span>
      </p>
    </div>
  )
}

function resolveStatusLabel(sessionMeta, t) {
  const statusKey = sessionMeta?.status
  if (statusKey === 'Pending') return t('analytics.statusPending')
  if (statusKey === 'Cancelled') return t('analytics.statusCancelled')
  return t('mentorQuickView.openClass')
}

const MentorQuickViewModal = ({ open, mentor, sessionMeta, onClose }) => {
  const { t, labelFor, lang } = useTranslation()
  const localizedMentor = useLocalizedMentor(mentor)

  const id = localizedMentor?.id ?? localizedMentor?.userId
  const name = localizedMentor?.name
  const title = localizedMentor?.title
  const bio = localizedMentor?.bio
  const major = localizedMentor?.major
  const subject = localizedMentor?.subject
  const province = mentor?.province
  const location = mentor?.location
  const avatarUrl = resolveProfilePictureUrl(mentor?.avatarUrl)
  const verified = mentor?.verified
  const [educationLine, setEducationLine] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState([])
  const price = mentor?.price
  const phone = mentor?.phone

  const displayName = buildDisplayName(name, title)
  const specialization = buildSpecialization(localizedMentor)
  const displayBio =
    bio?.trim() ||
    t('mentorCard.defaultBio', { name: name || t('mentorCard.mentorFallback') })

  const locationLine =
    sessionMeta?.location ||
    localizedMentor?.location ||
    localizedMentor?.province ||
    ''

  const subjectLine = sessionMeta?.grade || subject || major || ''

  const timeLine = sessionMeta?.time || sessionMeta?.scheduleLine || ''
  const rateLine = sessionMeta?.rate || (price != null && price !== '' ? String(price) : '')

  const statusLabel = resolveStatusLabel(sessionMeta, t)
  const isOpenStatus = statusLabel === t('mentorQuickView.openClass')
  const compactCaps = lang === 'en' || !containsKhmerScript(displayName)

  const credentialTags = useMemo(
    () =>
      [
        { key: 'time', icon: Clock, label: t('mentorCard.time'), value: timeLine },
        { key: 'location', icon: MapPin, label: t('mentorQuickView.location'), value: locationLine },
        { key: 'subject', icon: GraduationCap, label: t('mentorQuickView.subject'), value: subjectLine },
        {
          key: 'education',
          icon: Star,
          label: t('mentorQuickView.education'),
          value: educationLine,
        },
        { key: 'rate', icon: Banknote, label: t('mentorQuickView.rate'), value: rateLine },
      ].filter((tag) => tag.value),
    [timeLine, locationLine, subjectLine, educationLine, rateLine, t]
  )

  const nameFontClass = contentFontClass(displayName)
  const bioFontClass = contentFontClass(displayBio)
  const specializationFontClass = contentFontClass(specialization)
  const profileHref = id ? `/mentor/${id}` : '#'
  const contactHref = phone ? `tel:${String(phone).replace(/\s/g, '')}` : `/contact`

  const contactButtonClass = clsx(
    'inline-flex w-full items-center justify-center gap-1 rounded-md',
    'bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-1.5',
    'text-sm font-semibold text-white leading-tight',
    lang === 'km' && 'font-khmer',
    'shadow-sm shadow-teal-600/15 transition-all',
    'hover:from-teal-700 hover:to-teal-600 active:scale-[0.99]'
  )

  useEffect(() => {
    if (!open || !id) {
      setEducationLine('')
      setPortfolioLinks([])
      return
    }
    if (!isApiEnabled()) {
      setEducationLine('')
      setPortfolioLinks([])
      return
    }
    let cancelled = false
    Promise.all([fetchMentorExperience(id), fetchMentorPortfolio(id)])
      .then(([experienceRows, portfolioRows]) => {
        if (cancelled) return
        const { education } = splitExperienceByType(experienceRows)
        const top = resolveEducationForProfileView(education)[0]
        setEducationLine(top ? formatEducationChip(top) : '')
        setPortfolioLinks(
          (portfolioRows ?? []).filter((item) => String(item.link ?? '').trim())
        )
      })
      .catch(() => {
        if (!cancelled) {
          setEducationLine('')
          setPortfolioLinks([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [open, id])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open || !mentor || !id) return null

  const contactButton =
    contactHref.startsWith('tel:') ? (
      <a href={contactHref} className={contactButtonClass}>
        <Mail className="h-3 w-3" strokeWidth={2.5} />
        <span className={compactCaps ? 'uppercase' : undefined}>{t('mentorQuickView.contact')}</span>
      </a>
    ) : (
      <Link to={contactHref} onClick={onClose} className={contactButtonClass}>
        <Mail className="h-3 w-3" strokeWidth={2.5} />
        <span className={compactCaps ? 'uppercase' : undefined}>{t('mentorQuickView.contact')}</span>
      </Link>
    )

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-5 bg-black/40 animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <article
        className={clsx(
          'relative flex w-full max-w-md flex-col overflow-hidden',
          'max-h-[min(92vh,40rem)]',
          'rounded-2xl bg-white shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-quick-view-name"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-10 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/80 hover:text-slate-600"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <header className="shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 pt-7 pb-5 text-center">
          <div className="relative mx-auto mb-3 w-fit">
            <Avatar
              src={avatarUrl}
              name={displayName}
              size="xl"
              className="!h-[5.25rem] !w-[5.25rem] ring-[3px] ring-white shadow-md"
            />
            {verified ? (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 ring-2 ring-white shadow-sm">
                <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
            ) : null}
          </div>

          <h2
            id="mentor-quick-view-name"
            className={clsx(
              'text-lg font-bold leading-snug text-slate-800 sm:text-xl',
              nameFontClass
            )}
          >
            {displayName}
          </h2>

          {specialization ? (
            <p className={clsx('mt-1 text-sm font-medium text-slate-500', specializationFontClass)}>
              {specialization}
            </p>
          ) : null}

          <div className="mt-2.5 inline-flex items-center justify-center gap-2">
            <span
              className={clsx(
                'h-2 w-2 rounded-full',
                isOpenStatus ? 'bg-emerald-500' : 'bg-amber-500'
              )}
              aria-hidden
            />
            <span
              className={clsx(
                'text-[11px] font-bold tracking-widest',
                compactCaps && 'uppercase',
                isOpenStatus ? 'text-emerald-600' : 'text-amber-600'
              )}
            >
              {statusLabel}
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 [scrollbar-gutter:stable]">
          <div className="space-y-4 pb-2">
            <section className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <SectionLabel compactCaps={compactCaps}>{t('mentorQuickView.aboutEducator')}</SectionLabel>
              <p
                className={clsx(
                  'whitespace-pre-line break-words text-left text-sm leading-relaxed text-slate-600',
                  bioFontClass
                )}
              >
                {displayBio}
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <SectionLabel compactCaps={compactCaps}>
                {t('mentorQuickView.detailsCredentials')}
              </SectionLabel>
              {credentialTags.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {credentialTags.map((tag) => (
                    <CredentialPill
                      key={tag.key}
                      icon={tag.icon}
                      label={tag.label}
                      value={tag.value}
                      compactCaps={compactCaps}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-1 text-center text-xs text-slate-400">{t('mentorQuickView.noCredentials')}</p>
              )}
            </section>

            {portfolioLinks.length > 0 ? (
              <section className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <SectionLabel compactCaps={compactCaps}>{t('mentorProfile.portfolio')}</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {portfolioLinks.map((item) => {
                    const link = String(item.link ?? '').trim()
                    const kind = detectPortfolioLinkKind(link)
                    const { Icon } = portfolioKindMeta(kind)
                    return (
                      <a
                        key={link}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 no-underline shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/40"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                        <span className="min-w-0 truncate">{portfolioDisplayTitle(item)}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                      </a>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <footer className="shrink-0 space-y-1.5 border-t border-slate-200 bg-white px-5 py-2.5 shadow-[0_-4px_16px_rgba(15,23,42,0.05)] sm:px-6">
          {contactButton}
          <Link
            to={profileHref}
            onClick={onClose}
            className="block text-center text-xs font-medium text-slate-400 transition-colors hover:text-teal-700"
          >
            {t('mentorQuickView.fullProfile')}
          </Link>
        </footer>
      </article>
    </div>,
    document.body
  )
}

export default MentorQuickViewModal

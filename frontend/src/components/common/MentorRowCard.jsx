import { Link } from 'react-router-dom'
import { Star, CheckCircle, ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import Avatar from '@/components/ui/Avatar'
import { buildHomeCardSubjectTags } from '@/components/common/TeachingFocusPills'
import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'
import { useTranslation, useLocalizedMentor } from '@/i18n'
import { contentFontClass } from '@/utils/khmerTextUtils'
import { trackMentorDetailClick } from '@/utils/mentorViewTracking'
import { useMentorQuickView } from '@/contexts/MentorQuickViewContext'

const HONORIFIC = /^(dr|prof|mr|mrs|ms|assoc\.?\s*prof)\.?\s*$/i

function buildDisplayName(name, title) {
  const trimmedTitle = title?.trim() ?? ''
  if (!trimmedTitle) return name
  if (HONORIFIC.test(trimmedTitle) || trimmedTitle.length <= 4) {
    return `${trimmedTitle} ${name}`.trim()
  }
  return name
}

/** Figma HOME — horizontal mentor row card */
const MentorRowCard = ({ mentor, className }) => {
  const { t, labelFor, lang } = useTranslation()
  const localizedMentor = useLocalizedMentor(mentor)
  const quickView = useMentorQuickView()
  const {
    id,
    name,
    title,
    major,
    subject,
    subjects = [],
    skillItems = [],
    bio,
    rating = 0,
    reviewCount = 0,
    avatarUrl,
    verified,
  } = localizedMentor ?? mentor ?? {}

  const displayName = buildDisplayName(name, title)
  const subjectTags = buildHomeCardSubjectTags({
    skillItems,
    subjects,
    major,
    subject,
    labelFor,
    lang,
  })

  const displayBio =
    bio?.trim() ||
    t('mentorCard.defaultBio', { name: name || t('mentorCard.mentorFallback') })

  const showRating = rating > 0 || reviewCount > 0
  const khmerContentClass = contentFontClass(displayName, displayBio, ...subjectTags)
  const profileHref = `/mentor/${id}`

  const openQuickView = () => {
    quickView?.openQuickView(mentor)
  }

  const btnBase =
    'inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-[13px]'

  return (
    <article
      className={clsx(
        'group flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm',
        'transition-all duration-200 hover:border-slate-200/90 hover:shadow-md',
        'sm:gap-5 sm:p-5',
        className
      )}
    >
      <button
        type="button"
        onClick={openQuickView}
        className="relative inline-block shrink-0 text-left transition-opacity hover:opacity-95"
        aria-label={t('mentorCard.viewProfile')}
      >
        <Avatar
          src={resolveProfilePictureUrl(avatarUrl)}
          name={displayName}
          size="lg"
          className="!h-[88px] !w-[76px] !rounded-2xl sm:!h-[96px] sm:!w-[84px] [&_img]:!rounded-2xl [&>div]:!rounded-2xl"
        />
        {verified ? (
          <span
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 shadow-sm ring-2 ring-white"
            aria-hidden
          >
            <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </span>
        ) : null}
      </button>

      <div className={clsx('flex min-w-0 flex-1 flex-col', khmerContentClass)}>
        {/* Figma rows: name + badge | stats | tags */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={openQuickView}
              className="min-w-0 text-left transition-colors hover:text-slate-700"
            >
              <h3 className="truncate text-base font-bold leading-tight text-slate-900 sm:text-[17px]">
                {displayName}
              </h3>
            </button>
            {verified ? (
              <span className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 sm:text-[10px]">
                {t('mentorCard.verified')}
              </span>
            ) : null}
          </div>

          {showRating && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
                <span className="font-normal text-slate-500">
                  ({t('mentorProfile.reviews', { count: reviewCount })})
                </span>
              </span>
            </div>
          )}

          {subjectTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {subjectTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200/80 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-teal-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {displayBio}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:mt-3">
          <button
            type="button"
            onClick={openQuickView}
            className={clsx(
              btnBase,
              'bg-gradient-to-r from-teal-600 to-teal-500 text-white',
              'shadow-sm shadow-teal-600/20 transition-all duration-200',
              'hover:from-teal-700 hover:to-teal-600',
              'active:scale-[0.98]'
            )}
          >
            {t('mentorCard.viewProfile')}
          </button>
          <Link
            to={profileHref}
            onClick={() => trackMentorDetailClick(id)}
            className={clsx(
              btnBase,
              'border border-slate-200 bg-slate-50/80 text-slate-700',
              'transition-all duration-200',
              'hover:border-slate-300 hover:bg-white hover:text-slate-900',
              'active:scale-[0.98]'
            )}
          >
            {t('mentorCard.detail')}
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-teal-600" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default MentorRowCard

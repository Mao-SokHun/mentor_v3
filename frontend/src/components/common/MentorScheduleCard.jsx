import { Link } from 'react-router-dom'
import { Calendar, CheckCircle, MapPin } from 'lucide-react'
import clsx from 'clsx'
import Avatar from '@/components/ui/Avatar'
import { useTranslation, useLocalizedMentor } from '@/i18n'
import { skillRowLabel } from '@/services/mentors/mentorService'
import { contentFontClass } from '@/utils/khmerTextUtils'
import { trackMentorDetailClick } from '@/utils/mentorViewTracking'
import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'
import { FILTER_ALL } from '@/constants'

const HONORIFIC = /^(dr|prof|mr|mrs|ms|assoc\.?\s*prof)\.?\s*$/i

function buildDisplayName(name, title) {
  const trimmedTitle = title?.trim() ?? ''
  if (!trimmedTitle) return name
  if (HONORIFIC.test(trimmedTitle) || trimmedTitle.length <= 4) {
    return `${trimmedTitle} ${name}`.trim()
  }
  return name
}

function buildScheduleTimeLine({ sessionDate, timeSlot, labelFor }) {
  const slot =
    timeSlot && timeSlot !== FILTER_ALL.time ? String(labelFor(timeSlot) ?? timeSlot).trim() : ''
  const date = String(sessionDate ?? '').trim()

  if (slot.includes('·')) return slot
  if (date && slot) return `${date} · ${slot}`
  return date || slot || null
}

function parseScheduleLine(line) {
  const text = String(line ?? '').trim()
  if (!text) return { date: '', time: '' }
  const parts = text.split('·').map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return { date: parts[0], time: parts.slice(1).join(' · ') }
  }
  return { date: '', time: text }
}

/** Schedule grid card — mentor avatar, session meta, detail CTA */
const MentorScheduleCard = ({
  postId,
  mentor,
  timeSlot,
  sessionDate = '',
  sessionTitle = '',
  provinceName = '',
  sessionNotes = '',
  className,
}) => {
  const { t, labelFor, lang, isKhmer } = useTranslation()
  const localizedMentor = useLocalizedMentor(mentor)
  const {
    id,
    name,
    title,
    major,
    subject,
    avatarUrl,
    verified,
    postSubSkillRow,
    postSkillRow,
  } = localizedMentor ?? mentor ?? {}

  const displayName = buildDisplayName(name, title)
  const displayMajor = postSkillRow
    ? skillRowLabel(postSkillRow, lang)
    : major || ''
  const displaySubject = postSubSkillRow
    ? skillRowLabel(postSubSkillRow, lang)
    : subject || ''

  const skillsLine = [displayMajor, displaySubject].filter(Boolean).join(' · ')

  const rawProvince =
    String(provinceName ?? '').trim() ||
    (localizedMentor?.province &&
    localizedMentor.province !== FILTER_ALL.location
      ? String(localizedMentor.province).trim()
      : '')
  const locationLine = rawProvince ? labelFor(rawProvince) : ''

  const scheduleLine = buildScheduleTimeLine({ sessionDate, timeSlot, labelFor })
  const { date: scheduleDate, time: scheduleTime } = parseScheduleLine(scheduleLine)
  const showVerified = Boolean(verified)

  const timeDisplay =
    scheduleDate && scheduleTime
      ? `${scheduleDate} · ${scheduleTime}`
      : scheduleDate || scheduleTime || scheduleLine

  const nameFontClass = contentFontClass(displayName)
  const khmerContentClass = contentFontClass(
    displayName,
    skillsLine,
    locationLine,
    timeDisplay,
    sessionNotes
  )

  const detailHref = postId ? `/schedule/post/${postId}` : `/mentor/${id}`

  return (
    <article
      className={clsx(
        'flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm',
        'transition-all duration-200 hover:border-teal-100 hover:shadow-md',
        className
      )}
    >
      <div className={clsx('flex gap-2.5 border-b border-slate-100 p-3', khmerContentClass)}>
        <Avatar
          src={resolveProfilePictureUrl(avatarUrl)}
          name={displayName}
          size="md"
          className="!h-10 !w-10 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3
              className={clsx(
                'truncate text-lg font-bold leading-tight text-slate-900',
                nameFontClass
              )}
            >
              {displayName}
            </h3>
            {showVerified ? (
              <CheckCircle
                className="h-3.5 w-3.5 shrink-0 fill-sky-50 text-sky-500"
                strokeWidth={2.5}
                aria-label={t('mentorCard.verified')}
              />
            ) : null}
          </div>
          {skillsLine ? (
            <p className="mt-0.5 truncate text-base font-semibold leading-snug text-teal-700">
              {skillsLine}
            </p>
          ) : sessionTitle ? (
            <p className="mt-0.5 truncate text-base font-semibold leading-snug text-teal-700">
              {sessionTitle}
            </p>
          ) : null}
          {locationLine ? (
            <p
              className={clsx(
                'mt-0.5 inline-flex items-center gap-1 truncate text-xs text-slate-500',
                contentFontClass(locationLine)
              )}
            >
              <MapPin className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
              {locationLine}
            </p>
          ) : null}
        </div>
      </div>

      <div className={clsx('flex flex-1 flex-col p-3', khmerContentClass)}>
        {String(sessionNotes ?? '').trim() ? (
          <p
            className={clsx(
              'text-xs font-medium leading-snug text-teal-800 line-clamp-1',
              contentFontClass(sessionNotes)
            )}
          >
            {sessionNotes}
          </p>
        ) : null}

        {timeDisplay ? (
          <div
            className={clsx(
              'rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5',
              String(sessionNotes ?? '').trim() ? 'mt-1.5' : 'mt-0'
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {t('mentorCard.time')}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold leading-snug text-teal-800">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
              <span className="min-w-0 break-words">{timeDisplay}</span>
            </p>
          </div>
        ) : null}

        <Link
          to={detailHref}
          className="mt-auto block w-full pt-1.5"
          onClick={() => id && trackMentorDetailClick(id)}
        >
          <span
            className={clsx(
              'flex w-full items-center justify-center rounded-md px-2.5 py-1',
              'bg-gradient-to-r from-teal-600 to-teal-500 font-semibold text-white leading-tight',
              isKhmer ? 'font-khmer text-sm' : 'text-sm',
              'shadow-sm shadow-teal-600/20 transition-all',
              'hover:from-teal-700 hover:to-teal-600 active:scale-[0.98]'
            )}
          >
            {t('mentorCard.detail')}
          </span>
        </Link>
      </div>
    </article>
  )
}

export default MentorScheduleCard

import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  MapPin,
} from 'lucide-react'
import clsx from 'clsx'
import { PageAmbient, PageCard } from '@/components'
import Avatar from '@/components/ui/Avatar'
import { useAuth } from '@/hooks'
import { useTranslation } from '@/i18n'
import { isApiEnabled } from '@/constants'
import { fetchSchedulePostDetail } from '@/services/mentors/mentorService'
import { mapPostToScheduleDetail } from '@/utils/schedulePostDetailUtils'
import { contentFontClass } from '@/utils/khmerTextUtils'
import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'
import { useMentorQuickView } from '@/contexts/MentorQuickViewContext'
import { trackMentorDetailClick } from '@/utils/mentorViewTracking'

const HONORIFIC = /^(dr|prof|mr|mrs|ms|assoc\.?\s*prof)\.?\s*$/i

function buildDisplayName(name, title) {
  const trimmedTitle = title?.trim() ?? ''
  if (!trimmedTitle) return name
  if (HONORIFIC.test(trimmedTitle) || trimmedTitle.length <= 4) {
    return `${trimmedTitle} ${name}`.trim()
  }
  return name
}

function MetaTile({ icon: Icon, label, children, accent, className }) {
  return (
    <div
      className={clsx(
        'flex min-w-0 flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-3.5',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            accent ? 'bg-teal-100 text-teal-700' : 'bg-white text-teal-600 shadow-sm ring-1 ring-slate-100'
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-[13px]">
          {label}
        </span>
      </div>
      <p
        className={clsx(
          'text-base font-bold leading-snug text-slate-900 sm:text-[17px]',
          accent && 'text-[#0c4a6e]'
        )}
      >
        {children}
      </p>
    </div>
  )
}

const SchedulePostDetail = () => {
  const { postId } = useParams()
  const { t, labelFor, lang } = useTranslation()
  const { user } = useAuth()
  const quickView = useMentorQuickView()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!postId) {
      setLoading(false)
      setError(true)
      return
    }

    if (!isApiEnabled()) {
      setLoading(false)
      setError(true)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    fetchSchedulePostDetail(postId)
      .then((result) => {
        if (cancelled) return
        if (!result?.post) {
          setError(true)
          setDetail(null)
          return
        }
        const mapped = mapPostToScheduleDetail(result.post, {
          t,
          mentor: result.mentor,
          lang,
        })
        if (!mapped?.mentor) {
          setError(true)
          setDetail(null)
        } else {
          setDetail(mapped)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setDetail(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postId, labelFor, t])

  if (!postId) return <Navigate to="/schedule" replace />

  if (loading) {
    return (
      <PageAmbient variant="schedule">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 space-y-4 animate-pulse">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
            <div className="h-6 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </PageAmbient>
    )
  }

  if (error || !detail) {
    return (
      <PageAmbient variant="schedule">
        <div className="max-w-2xl mx-auto py-16 text-center space-y-3 px-4">
          <p className="text-sm text-slate-600">{t('student.schedulePost.notFound')}</p>
          <Link
            to="/schedule"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('student.schedulePost.backToSchedule')}
          </Link>
        </div>
      </PageAmbient>
    )
  }

  const {
    mentor,
    title,
    sessionDate,
    timeDisplay,
    timeLabel,
    skillName,
    subSkillName,
    provinceName,
    sessionNotes,
  } = detail
  const displayName = buildDisplayName(mentor.name, mentor.title)
  const skillsLine = [skillName, subSkillName].filter(Boolean).join(' • ')
  const khmerClass = contentFontClass(
    displayName,
    title,
    skillsLine,
    provinceName,
    sessionNotes,
    timeLabel
  )
  const mentorHref = `/mentor/${mentor.id}`
  const canBook = user?.role === 'student'
  const scheduleTime = timeDisplay || (!sessionDate ? timeLabel : '')

  const metaTiles = [
    sessionDate
      ? { key: 'date', icon: Calendar, label: t('student.schedulePost.sessionDate'), value: sessionDate }
      : null,
    scheduleTime
      ? {
          key: 'time',
          icon: Clock,
          label: t('student.schedulePost.sessionTime'),
          value: scheduleTime,
          accent: true,
        }
      : null,
    provinceName
      ? { key: 'location', icon: MapPin, label: t('filters.province'), value: provinceName }
      : null,
  ].filter(Boolean)

  return (
    <PageAmbient variant="schedule" className="pb-10">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 space-y-4">
        <Link
          to="/schedule"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          {t('student.schedulePost.backToSchedule')}
        </Link>

        <PageCard
          padding={false}
          className={clsx(
            'overflow-hidden rounded-2xl border border-slate-200/70 shadow-md shadow-slate-200/40',
            khmerClass
          )}
        >
          {/* Header */}
          <div className="relative px-5 pt-6 pb-5 sm:px-6 sm:pt-7 bg-gradient-to-br from-teal-50/80 via-white to-white border-b border-slate-100">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 to-teal-400 rounded-r-full" />
            <div className="pl-2">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight sm:text-[1.65rem]">
                {title}
              </h1>
              {skillsLine ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <GraduationCap className="w-4 h-4 shrink-0 text-teal-600" aria-hidden />
                  <span>{skillsLine}</span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Meta grid — full width, 3 equal columns when possible */}
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {metaTiles.length > 0 ? (
              <div
                className={clsx(
                  'grid gap-3',
                  metaTiles.length === 1 && 'grid-cols-1',
                  metaTiles.length === 2 && 'grid-cols-1 sm:grid-cols-2',
                  metaTiles.length >= 3 && 'grid-cols-1 sm:grid-cols-3'
                )}
              >
                {metaTiles.map((tile) => (
                  <MetaTile
                    key={tile.key}
                    icon={tile.icon}
                    label={tile.label}
                    accent={tile.accent}
                  >
                    {tile.value}
                  </MetaTile>
                ))}
              </div>
            ) : null}

            {sessionNotes ? (
              <div className="mt-5 rounded-xl border border-slate-200/80 bg-white px-4 py-4 sm:px-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 sm:text-[13px]">
                  {t('student.schedulePost.aboutSession')}
                </h2>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed whitespace-pre-line">
                  {sessionNotes}
                </p>
              </div>
            ) : null}
          </div>

          {/* Mentor — full-width footer, no side inset gap */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 sm:text-[13px]">
              {t('student.schedulePost.mentorSection')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar
                  src={resolveProfilePictureUrl(mentor.avatarUrl)}
                  name={displayName}
                  size="md"
                  className="!rounded-full !h-12 !w-12 sm:!h-14 sm:!w-14 ring-2 ring-amber-400/90 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-base text-slate-900 truncate sm:text-[17px]">
                      {displayName}
                    </p>
                    <CheckCircle
                      className="w-4 h-4 shrink-0 text-sky-500 fill-sky-50"
                      aria-label={t('mentorCard.verified')}
                    />
                  </div>
                  {skillsLine ? (
                    <p className="text-sm text-slate-500 truncate mt-0.5">{skillsLine}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    quickView?.openQuickView(mentor, {
                      time: [sessionDate, scheduleTime].filter(Boolean).join(' · '),
                      sessionDate,
                      location: provinceName,
                      grade: subSkillName || skillName,
                      status: 'Active',
                    })
                  }
                  className={clsx(
                    'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold sm:text-[13px]',
                    'bg-gradient-to-r from-teal-600 to-teal-500 text-white',
                    'shadow-sm shadow-teal-600/20 transition-all duration-200',
                    'hover:from-teal-700 hover:to-teal-600',
                    'active:scale-[0.98]'
                  )}
                >
                  {t('mentorCard.viewProfile')}
                </button>
                <Link
                  to={mentorHref}
                  onClick={() => trackMentorDetailClick(mentor.id)}
                  className={clsx(
                    'inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-[13px]',
                    'border border-slate-200 bg-white text-slate-700',
                    'transition-all duration-200 hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50/50',
                    'active:scale-[0.98]'
                  )}
                >
                  {t('mentorCard.detail')}
                </Link>
                {canBook ? (
                  <Link
                    to={`/book/${mentor.id}`}
                    className={clsx(
                      'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold sm:text-[13px]',
                      'border border-slate-200 bg-white text-slate-700',
                      'transition-all duration-200 hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50/50',
                      'active:scale-[0.98]'
                    )}
                  >
                    {t('student.schedulePost.bookSession')}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </PageCard>
      </div>
    </PageAmbient>
  )
}

export default SchedulePostDetail

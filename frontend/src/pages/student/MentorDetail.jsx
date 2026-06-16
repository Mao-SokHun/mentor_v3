import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Star,
} from 'lucide-react'
import clsx from 'clsx'
import Avatar from '../../components/ui/Avatar'
import { PageCard } from '@/components'
import TeachingFocusPills, { buildTeachingFocusRows } from '@/components/common/TeachingFocusPills'
import { useAuth, useMentorDetail } from '@/hooks'
import { useTranslation } from '@/i18n'
import { SHARED_ROUTES, STUDENT_ROUTES } from '@/constants/student/studentRoutes'
import { splitExperienceByType } from '@/services/mentors/mentorService'
import {
  resolveEducationForProfileView,
  resolveWorkExperienceForProfileView,
} from '@/utils/mentorOwnProfileUtils'

const HONORIFIC = /^(dr|prof|mr|mrs|ms|assoc\.?\s*prof)\.?\s*$/i

const CRED_COLORS = [
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',
  'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600',
]

function buildDisplayName(name, title) {
  const trimmedTitle = title?.trim() ?? ''
  if (!trimmedTitle) return name
  if (HONORIFIC.test(trimmedTitle) || trimmedTitle.length <= 4) {
    return `${trimmedTitle} ${name}`.trim()
  }
  return name
}

function buildCredentialLine(mentor) {
  const title = mentor?.title?.trim() ?? ''
  if (title && !HONORIFIC.test(title) && title.length > 4) return title
  const parts = [mentor?.major, mentor?.subject].filter(Boolean)
  return parts.join(' · ')
}

function SectionLabel({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-sm sm:text-base font-bold text-teal-700 leading-snug">
        {children}
      </h2>
      {action}
    </div>
  )
}

const MentorDetail = () => {
  const { t, labelFor, lang } = useTranslation()
  const { user } = useAuth()
  const { id } = useParams()
  const { mentor, credentials, availabilitySlots, experience, loading, error } = useMentorDetail(id)
  const canBook = user?.role !== 'mentor' && user?.role !== 'admin'

  const { education: educationSource, work: workSource } = useMemo(
    () => splitExperienceByType(experience),
    [experience]
  )
  const educationRows = useMemo(
    () => resolveEducationForProfileView(educationSource),
    [educationSource]
  )
  const workRows = useMemo(
    () => resolveWorkExperienceForProfileView(workSource),
    [workSource]
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        {t('student.loadingMentors')}
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 font-medium">{t('student.noMentors')}</p>
        <Link to={SHARED_ROUTES.home} className="text-primary-600 text-sm mt-4 inline-block">
          {t('mentorDetail.backToTeachers')}
        </Link>
      </div>
    )
  }

  const displayName = buildDisplayName(mentor.name, mentor.title)
  const credentialLine = buildCredentialLine(mentor)
  const teachingRows = buildTeachingFocusRows({
    skillItems: mentor.skillItems ?? [],
    major: mentor.major,
    subject: mentor.subject,
    labelFor,
    lang,
  })
  const messageName = mentor.firstName || mentor.name?.split(' ')[0] || mentor.name
  const showVerified = Boolean(mentor.verified)
  const years = mentor.experienceYears ?? mentor.experience ?? 0
  const hasSlots = availabilitySlots.length > 0
  const bioText = mentor.bio?.trim() || t('mentorCard.defaultBio', { name: mentor.name })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <Link
        to={SHARED_ROUTES.home}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('mentorDetail.backToTeachers')}
      </Link>

      {/* Header card */}
      <PageCard className="!p-5 sm:!p-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 lg:items-center">
          <div className="flex flex-1 gap-4 sm:gap-5 min-w-0">
            <div className="flex-shrink-0">
              <Avatar
                src={mentor.avatarUrl}
                name={displayName}
                size="2xl"
                className="!w-24 !h-24 sm:!w-28 sm:!h-28 !rounded-2xl ring-4 ring-white shadow-md"
              />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                {showVerified && (
                  <CheckCircle className="w-5 h-5 text-sky-500 fill-sky-50 shrink-0" strokeWidth={2.5} />
                )}
              </div>
              {credentialLine ? (
                <p className="text-sm sm:text-base text-slate-600 mt-1 leading-snug">{credentialLine}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-500">
                {mentor.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800">{mentor.rating.toFixed(1)}</span>
                    <span>
                      ({t('mentorProfile.reviews', { count: mentor.reviewCount ?? 0 })})
                    </span>
                  </span>
                )}
                {mentor.location || mentor.province ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    {mentor.location || mentor.province}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="lg:flex-shrink-0 w-full lg:w-auto flex flex-col sm:flex-row gap-2">
            {canBook && (
              <Link to={STUDENT_ROUTES.book(id)} className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  {t('mentorDetail.bookSession')}
                </button>
              </Link>
            )}
            <Link to={SHARED_ROUTES.messages} className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary-200 text-primary-700 hover:bg-primary-50 text-sm font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                {t('mentorDetail.messageMentor', { name: messageName })}
              </button>
            </Link>
          </div>
        </div>
      </PageCard>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <PageCard>
            <SectionLabel>{t('mentorDetail.professionalBio')}</SectionLabel>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {bioText}
            </p>
          </PageCard>

          <PageCard>
            <SectionLabel>{t('mentorDetail.academicBackground')}</SectionLabel>
            {educationRows.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {educationRows.map((item) => (
                  <div
                    key={item.id ?? `${item.role}-${item.org}`}
                    className="flex gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      {item.period ? (
                        <p className="text-xs text-teal-700 font-medium">{item.period}</p>
                      ) : null}
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{item.org}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t('mentorDetail.noExperience')}</p>
            )}
          </PageCard>

          <PageCard>
            <SectionLabel>{t('mentorDetail.workExperience')}</SectionLabel>
            {workRows.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {workRows.map((item) => (
                  <div
                    key={item.id ?? `${item.role}-${item.org}`}
                    className="flex gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      {item.period ? (
                        <p className="text-xs text-teal-700 font-medium">{item.period}</p>
                      ) : null}
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{item.org}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t('mentorDetail.noWorkExperience')}</p>
            )}
          </PageCard>

          <PageCard>
            <SectionLabel>{t('mentorDetail.specializations')}</SectionLabel>
            {teachingRows.length > 0 ? (
              <TeachingFocusPills
                rows={teachingRows}
                majorLabel={t('filters.major')}
                subjectLabel={t('filters.subject')}
                size="md"
              />
            ) : (
              <p className="text-sm text-slate-500">{t('mentorDetail.noSpecializations')}</p>
            )}
          </PageCard>

          <PageCard>
            <SectionLabel
              action={
                <span className="text-xs font-medium text-teal-600">{t('mentorDetail.viewAllReviews')}</span>
              }
            >
              {t('mentorDetail.studentInsights')}
            </SectionLabel>
            <p className="text-sm text-slate-500 text-center py-6">{t('mentorDetail.noReviews')}</p>
          </PageCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PageCard>
            <SectionLabel>{t('mentorDetail.credentials')}</SectionLabel>
            {credentials.length > 0 ? (
              <ul className="space-y-3">
                {credentials.map((item, i) => {
                  const color = CRED_COLORS[i % CRED_COLORS.length]
                  return (
                    <li key={`${item.text}-${i}`} className="flex items-start gap-3">
                      <div
                        className={clsx(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          color.split(' ')[0]
                        )}
                      >
                        <Award className={clsx('w-4 h-4', color.split(' ')[1])} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{item.text}</p>
                        {item.sub && item.sub !== item.text ? (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{item.sub}</p>
                        ) : null}
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 rounded-lg border border-teal-200/80 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 no-underline hover:bg-teal-100 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" aria-hidden />
                            {t('mentorDetail.viewLink')}
                          </a>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div>
                <p className="text-sm text-slate-500">{t('mentorDetail.noCredentials')}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t('mentorDetail.credentialsHint')}</p>
              </div>
            )}
          </PageCard>

          <PageCard>
            <SectionLabel>{t('mentorDetail.availability')}</SectionLabel>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">{t('mentorDetail.responseTime')}</span>
                <span className="font-semibold text-slate-800">{t('mentorDetail.responseTimeValue')}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">{t('mentorDetail.activeSince')}</span>
                <span className="font-semibold text-slate-800">
                  {years > 0
                    ? t('mentorDetail.activeSinceValue', { count: years })
                    : '—'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              {hasSlots ? t('mentorDetail.acceptingStudents') : t('mentorDetail.notAcceptingStudents')}
            </p>
            {hasSlots && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  {t('mentorDetail.upcomingSessions')}
                </p>
                <div className="space-y-2">
                  {availabilitySlots.slice(0, 4).map((slot) => (
                    <div
                      key={slot.id ?? slot.label}
                      className="rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2.5"
                    >
                      {slot.topic ? (
                        <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                          {slot.topic}
                        </p>
                      ) : null}
                      {slot.subject && slot.title && slot.subject !== slot.title ? (
                        <p className="text-[11px] font-medium text-teal-700 mt-0.5 line-clamp-1">
                          {slot.subject}
                        </p>
                      ) : null}
                      <p className="text-xs font-semibold text-sky-900 mt-1.5">{slot.label}</p>
                      {slot.notes ? (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {slot.notes}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Link to="/messages" className="block mt-5">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-teal-200 text-teal-800 text-sm font-semibold hover:bg-teal-50/80 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t('mentorDetail.sendInquiry')}
              </button>
            </Link>
          </PageCard>
        </div>
      </div>
    </div>
  )
}

export default MentorDetail

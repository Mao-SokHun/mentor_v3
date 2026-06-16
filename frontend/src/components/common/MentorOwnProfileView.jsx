import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from 'lucide-react'
import clsx from 'clsx'
import Avatar from '../ui/Avatar'
import MentorEditSectionCard from './MentorEditSectionCard'
import TeachingFocusPills, { buildTeachingFocusRows } from './TeachingFocusPills'
import { useTranslation, useLocalizedMentor } from '@/i18n'
import { formatMentorDisplayName } from '@/lib/mentorApiMap'
import { splitExperienceByType } from '@/services/mentors/mentorService'
import {
  classifyPortfolioEntryMode,
  detectPortfolioLinkKind,
  portfolioDisplayTitle,
  portfolioKindMeta,
} from '@/utils/portfolioUtils'
import {
  profileContactFields,
  resolveEducationForProfileView,
  resolveWorkExperienceForProfileView,
} from '@/utils/mentorOwnProfileUtils'
import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'

const SCHEDULE_BADGES = [
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-amber-50 text-amber-800 border-amber-100',
  'bg-slate-50 text-slate-600 border-slate-100',
]

function buildDisplayName(profile) {
  return (
    formatMentorDisplayName({
      firstName: profile.firstName,
      lastName: profile.lastName,
    }) ||
    profile.name ||
    ''
  )
}

function buildSubtitle(profile) {
  const province = profile.province || profile.city
  const parts = [profile.subject || profile.major, province].filter(Boolean)
  return parts.join(' · ')
}

function partitionPortfolio(items = []) {
  const links = []
  const documents = []
  for (const item of items) {
    if (classifyPortfolioEntryMode(item) === 'document') documents.push(item)
    else links.push(item)
  }
  return { links, documents }
}

function CollapsiblePanel({ icon: Icon, title, count, open, onToggle, children, empty }) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
      >
        <Icon className="w-3 h-3 text-slate-500 shrink-0" />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {count > 0 ? (
          <span className="rounded-full bg-teal-50 px-1.5 text-xs font-bold text-teal-700">
            {count}
          </span>
        ) : null}
        <span className="ml-auto text-xs text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div className="border-t border-slate-100 p-1.5 space-y-1">
          {children}
          {!count && empty ? <p className="text-[11px] text-slate-400 py-0.5">{empty}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

function CompactExperienceRow({ item }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="flex items-baseline gap-2 min-w-0">
        {item.period ? (
          <span className="shrink-0 text-[11px] font-semibold text-teal-700 tabular-nums">
            {item.period}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800 truncate">{item.role || '—'}</p>
          <p className="text-[11px] text-slate-500 truncate">{item.org || '—'}</p>
        </div>
      </div>
    </div>
  )
}

function PortfolioLinkChip({ item }) {
  const link = String(item.link ?? '').trim()
  const kind = detectPortfolioLinkKind(link)
  const { Icon } = portfolioKindMeta(kind)
  const title = portfolioDisplayTitle(item)
  if (!link) return null
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 no-underline hover:border-teal-200 hover:bg-teal-50/40 transition-colors"
    >
      <Icon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
    </a>
  )
}

function PortfolioDocChip({ item }) {
  const title = portfolioDisplayTitle(item)
  const file = item.files?.[0]
  const href = file?.url || item.link
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 no-underline hover:border-teal-200 hover:bg-teal-50/40 transition-colors"
    >
      <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{title || file?.file_name}</span>
      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
    </a>
  )
}

function ProfilePortfolio({ portfolio, t }) {
  const { links, documents } = partitionPortfolio(portfolio)
  const filledLinks = links.filter((i) => String(i.link ?? '').trim())
  const filledDocs = documents.filter(
    (i) => (i.files?.length ?? 0) > 0 || String(i.title ?? '').trim()
  )
  const [linksOpen, setLinksOpen] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)

  if (!filledLinks.length && !filledDocs.length) {
    return (
      <p className="text-xs text-slate-500 text-center py-4 rounded-lg border border-dashed border-slate-200">
        {t('mentorProfile.portfolioEmptyHint')}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <CollapsiblePanel
        icon={Link2}
        title={t('mentorProfile.portfolioLinksSection')}
        count={filledLinks.length}
        open={linksOpen}
        onToggle={() => setLinksOpen((v) => !v)}
        empty={t('mentorProfile.portfolioSectionEmpty')}
      >
        {filledLinks.map((item) => (
          <PortfolioLinkChip key={item.id ?? item.link} item={item} />
        ))}
      </CollapsiblePanel>
      <CollapsiblePanel
        icon={FileText}
        title={t('mentorProfile.portfolioDocumentsSection')}
        count={filledDocs.length}
        open={docsOpen}
        onToggle={() => setDocsOpen((v) => !v)}
        empty={t('mentorProfile.portfolioSectionEmpty')}
      >
        {filledDocs.map((item) => (
          <PortfolioDocChip key={item.id ?? item.link} item={item} />
        ))}
      </CollapsiblePanel>
    </div>
  )
}

function ContactItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xs font-medium text-slate-800 break-words leading-snug">{value}</p>
      </div>
    </div>
  )
}

const MentorOwnProfileView = ({ profile, experience = [], publishedSlots = [], portfolio = [] }) => {
  const { t, labelFor, lang } = useTranslation()
  const localizedProfile = useLocalizedMentor(profile) ?? profile

  const displayName = buildDisplayName(localizedProfile)
  const subtitle = buildSubtitle(localizedProfile)
  const { education: educationSource, work: workSource } = splitExperienceByType(experience)
  const educationRows = resolveEducationForProfileView(educationSource)
  const workRows = resolveWorkExperienceForProfileView(workSource)
  const teachingRows = buildTeachingFocusRows({
    skillItems: localizedProfile.skillItems ?? [],
    major: localizedProfile.major,
    subject: localizedProfile.subject,
    labelFor,
    lang,
  })
  const contactRows = profileContactFields(localizedProfile, t, lang)
  const hasBio = Boolean(localizedProfile.bio?.trim())

  const contactIcons = {
    [t('profile.email')]: Mail,
    [t('profile.mobile')]: Phone,
    [t('filters.location')]: MapPin,
  }

  const editBtnClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors whitespace-nowrap'

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-6">
      <MentorEditSectionCard>
        <div className="flex items-center gap-3">
          <Avatar
            src={resolveProfilePictureUrl(profile.avatarUrl ?? profile.profilePicture)}
            name={displayName}
            size="lg"
            className="!w-14 !h-14 sm:!w-16 sm:!h-16 !rounded-full ring-2 ring-teal-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              {displayName}
            </h1>
            {subtitle ? (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>
            ) : null}
          </div>
          <Link to="/mentor/edit-profile" className={clsx(editBtnClass, 'hidden sm:inline-flex shrink-0')}>
            <Pencil className="w-3.5 h-3.5" />
            {t('mentorProfile.editTitle')}
          </Link>
        </div>
        <div className="sm:hidden mt-3 pt-3 border-t border-slate-100">
          <Link to="/mentor/edit-profile" className={clsx(editBtnClass, 'w-full justify-center')}>
            <Pencil className="w-3.5 h-3.5" />
            {t('mentorProfile.editTitle')}
          </Link>
        </div>
      </MentorEditSectionCard>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <MentorEditSectionCard icon={User} title={t('mentorProfile.detailAboutYou')}>
            {hasBio ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-[12]">
                {profile.bio.trim()}
              </p>
            ) : (
              <p className="text-xs text-slate-500">{t('profile.noBio')}</p>
            )}
          </MentorEditSectionCard>

          {teachingRows.length > 0 ? (
            <MentorEditSectionCard icon={GraduationCap} title={t('mentorProfile.teachingFocus')}>
              <TeachingFocusPills
                rows={teachingRows}
                majorLabel={t('filters.major')}
                subjectLabel={t('filters.subject')}
                size="sm"
              />
            </MentorEditSectionCard>
          ) : null}

          {(educationRows.length > 0 || workRows.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {educationRows.length > 0 ? (
                <MentorEditSectionCard icon={GraduationCap} title={t('mentorDetail.academicBackground')}>
                  <div className="space-y-1.5">
                    {educationRows.map((item) => (
                      <CompactExperienceRow key={item.id ?? item.dbId ?? item.period} item={item} />
                    ))}
                  </div>
                </MentorEditSectionCard>
              ) : null}
              {workRows.length > 0 ? (
                <MentorEditSectionCard icon={Briefcase} title={t('mentorDetail.workExperience')}>
                  <div className="space-y-1.5">
                    {workRows.map((item) => (
                      <CompactExperienceRow key={item.id ?? item.dbId ?? item.org} item={item} />
                    ))}
                  </div>
                </MentorEditSectionCard>
              ) : null}
            </div>
          )}

          <MentorEditSectionCard bodyClassName="!p-3">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
              <Link2 className="w-3.5 h-3.5 shrink-0 text-slate-500" strokeWidth={2} />
              <h2 className="text-sm font-semibold text-slate-800 truncate">{t('mentorProfile.portfolio')}</h2>
            </div>
            <ProfilePortfolio portfolio={portfolio} t={t} />
          </MentorEditSectionCard>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4">
          {contactRows.length > 0 ? (
            <MentorEditSectionCard icon={User} title={t('mentorProfile.personalInfo')}>
              <div className="space-y-3">
                {contactRows.map((row) => (
                  <ContactItem
                    key={row.label}
                    icon={contactIcons[row.label] ?? User}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </div>
            </MentorEditSectionCard>
          ) : null}

          <MentorEditSectionCard icon={Calendar} title={t('mentorProfile.schedulePublished')}>
            {publishedSlots.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-xs text-slate-500">{t('mentorProfile.schedulePublishedEmpty')}</p>
                <Link
                  to="/mentor/create"
                  className="inline-flex mt-2 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  {t('mentorProfile.schedulePostCta')}
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {publishedSlots.map((slot, idx) => (
                  <div
                    key={slot.id ?? idx}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {String(slot.day ?? '').toUpperCase()}
                    </p>
                    <p className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-800">
                      <Clock className="w-3 h-3 text-teal-600" />
                      {slot.time || '—'}
                    </p>
                    {slot.subject ? (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{slot.subject}</p>
                    ) : null}
                    {slot.skill && slot.skill !== slot.subject ? (
                      <span
                        className={clsx(
                          'inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border',
                          SCHEDULE_BADGES[idx % SCHEDULE_BADGES.length]
                        )}
                      >
                        {slot.skill}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </MentorEditSectionCard>
        </aside>
      </div>
    </div>
  )
}

export default MentorOwnProfileView

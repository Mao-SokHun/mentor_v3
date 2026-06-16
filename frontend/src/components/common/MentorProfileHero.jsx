import { Star, Users, Clock, Mail, Phone, MapPin } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { PageCard } from '@/components'
import { useTranslation } from '@/i18n'

const formatLocation = (profile) => {
  const parts = [
    profile.locationVillage,
    profile.locationCommune,
    profile.locationDistrict,
    profile.province,
  ].filter(Boolean)
  return parts.join(', ')
}

const MentorProfileHero = ({ profile }) => {
  const { t, labelFor } = useTranslation()
  const fullStars = Math.floor(profile.rating)

  return (
    <PageCard className="overflow-hidden p-0">
      <div className="h-16 bg-gradient-to-r from-primary-100/80 via-primary-50/50 to-sky-50/60" />
      <div className="px-5 pb-5 -mt-10">
        <Avatar name={profile.displayName} size="xl" className="ring-4 ring-white shadow-md" />
        <div className="mt-4">
          <h2 className="text-lg font-bold text-slate-800">{profile.displayName}</h2>
          {(profile.subject || profile.major) && (
            <p className="text-sm text-slate-500 mt-0.5">
              {[profile.subject, profile.major].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-2 space-y-1">
            {profile.major ? (
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-600">{t('filters.major')}:</span>{' '}
                {labelFor(profile.major)}
              </p>
            ) : null}
            {profile.subject ? (
              <p className="text-xs text-primary-700 font-medium">
                <span className="font-semibold text-slate-600">{t('filters.subject')}:</span>{' '}
                {labelFor(profile.subject || profile.primarySubject)}
              </p>
            ) : null}
          </div>
          {profile.subjects?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.subjects.map((item) => (
                <Badge key={item} variant="primary">
                  {labelFor(item)}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < fullStars
                    ? 'w-4 h-4 fill-amber-400 text-amber-400'
                    : 'w-4 h-4 text-slate-200'
                }
              />
            ))}
            <span className="text-xs text-slate-400 ml-1">
              {profile.rating} · {t('mentorProfile.reviews', { count: profile.reviewCount })}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-800 font-medium">
              <Users className="w-3.5 h-3.5" />
              {t('mentorProfile.groupStudents', { count: profile.groupStudents })}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              {t('mentorProfile.hoursTaught', { count: profile.hoursTaught })}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-sm text-slate-600">
          <p className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-sky-500" />
            </span>
            {formatLocation(profile)}
          </p>
          <p className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-violet-500" />
            </span>
            <span className="truncate">{profile.email}</span>
          </p>
          <p className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-emerald-500" />
            </span>
            {profile.phone}
          </p>
        </div>
      </div>
    </PageCard>
  )
}

export default MentorProfileHero

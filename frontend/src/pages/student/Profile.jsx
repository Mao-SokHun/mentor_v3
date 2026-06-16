import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, MapPin, GraduationCap, Mail, Phone } from 'lucide-react'
import { useAuth } from '@/hooks'
import { PageScaffold, PageCard, PageAmbient } from '@/components'
import { useTranslation } from '@/i18n'
import Avatar from '../../components/ui/Avatar'
import { resolveStudentProfile } from '@/lib/studentProfile'
import { isApiEnabled } from '@/constants'
import { fetchProvinces } from '@/services/mentors/mentorService'
import { resolveProvinceDisplayLabel } from '@/utils/provinceOptions'

const Profile = () => {
  const { user } = useAuth()
  const { t, labelFor, lang } = useTranslation()
  const profile = resolveStudentProfile(user)
  const [provinces, setProvinces] = useState([])
  const displayName = profile.displayName || t('auth.student')
  const studentId = user?.id ? String(user.id).padStart(5, '0') : '—'

  useEffect(() => {
    if (!isApiEnabled()) return
    let cancelled = false
    fetchProvinces()
      .then((rows) => {
        if (!cancelled) setProvinces(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!cancelled) setProvinces([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const provinceLabel = resolveProvinceDisplayLabel(
    profile.location || profile.province,
    provinces,
    lang
  )

  return (
    <PageAmbient variant="ambient">
      <PageScaffold
        title={t('profile.studentTitle')}
        subtitle={t('profile.studentSubtitle')}
        action={
          <Link
            to="/student/edit-profile"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-primary-200 hover:text-primary-600 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t('settings.editProfile')}
          </Link>
        }
      >
        <div className="grid lg:grid-cols-3 gap-5">
          <PageCard className="flex flex-col items-center text-center gap-3">
            <Avatar name={displayName} size="xl" />
            <div>
              <h2 className="text-base font-bold text-slate-800">{displayName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('profile.studentId')}: {studentId}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full pt-3 border-t border-slate-100 text-sm text-slate-600">
              {profile.learningFocus ? (
                <p className="flex items-center justify-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary-500" />
                  {labelFor(profile.learningFocus)}
                </p>
              ) : null}
              {profile.location || profile.province ? (
                <p className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  {provinceLabel}
                </p>
              ) : null}
            </div>
          </PageCard>

          <div className="lg:col-span-2 space-y-4">
            <PageCard>
              <h3 className="font-bold text-slate-800 text-sm mb-4">{t('profile.contactDetails')}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('profile.email')}</p>
                    <p className="text-sm font-medium text-slate-700 truncate">{profile.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('profile.mobile')}</p>
                    <p className="text-sm font-medium text-slate-700">{profile.phone || '—'}</p>
                  </div>
                </div>
              </div>
            </PageCard>

            <PageCard>
              <h3 className="font-bold text-slate-800 text-sm mb-2">{t('profile.aboutMe')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {profile.bio || t('profile.noBio')}
              </p>
            </PageCard>

            {profile.interests.length > 0 && (
              <PageCard>
                <h3 className="font-bold text-slate-800 text-sm mb-3">{t('profile.learningPreferences')}</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium"
                    >
                      {labelFor(s)}
                    </span>
                  ))}
                </div>
              </PageCard>
            )}
          </div>
        </div>
      </PageScaffold>
    </PageAmbient>
  )
}

export default Profile

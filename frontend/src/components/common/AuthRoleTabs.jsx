import { GraduationCap, BookOpen } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'

const AuthRoleTabs = ({ role, selectRole }) => {
  const { t } = useTranslation()

  const roles = [
    { value: 'student', label: t('auth.student'), icon: GraduationCap, desc: t('auth.studentDesc') },
    { value: 'mentor', label: t('auth.mentor'), icon: BookOpen, desc: t('auth.mentorDesc') },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mb-5">
      {roles.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => selectRole(r.value)}
          className={clsx(
            'flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all duration-200',
            role === r.value
              ? 'border-primary-400 bg-primary-50 shadow-sm ring-1 ring-primary-200/60'
              : 'border-slate-200/80 hover:border-primary-200 bg-white/60'
          )}
        >
          <div
            className={clsx(
              'w-8 h-8 shrink-0 rounded-lg flex items-center justify-center',
              role === r.value ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
            )}
          >
            <r.icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span
              className={clsx(
                'block text-sm font-semibold leading-tight',
                role === r.value ? 'text-primary-700' : 'text-slate-700'
              )}
            >
              {r.label}
            </span>
            <span className="block text-[11px] text-slate-500 leading-snug mt-0.5">{r.desc}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default AuthRoleTabs

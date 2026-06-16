import { ChevronRight, PenSquare } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useTranslation } from '@/i18n'

const CommunityComposePrompt = ({ userName, onClick }) => {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-primary-100/90 bg-gradient-to-br from-white/95 via-white/80 to-primary-50/40 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary-200/90 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <Avatar name={userName} size="sm" className="flex-shrink-0 ring-2 ring-white shadow-sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-primary-800 transition-colors">
            {t('communityPost.composeTitle')}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
            {t('communityPost.composePrompt')}
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold shadow-sm group-hover:bg-primary-600 transition-colors flex-shrink-0">
          {t('communityPost.composeAction')}
          <ChevronRight className="w-4 h-4" />
        </span>
        <span className="sm:hidden w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
          <PenSquare className="w-4 h-4" />
        </span>
      </div>
    </button>
  )
}

export default CommunityComposePrompt

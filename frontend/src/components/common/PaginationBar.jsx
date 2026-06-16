import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'

const PaginationBar = ({
  page,
  pageSize,
  total,
  onPageChange,
}) => {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        {t('pagination.displaying', { from, to, total })}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={clsx(
                'w-9 h-9 rounded-lg text-sm font-semibold transition-colors',
                page === p
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
              )}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}
    </div>
  )
}

export default PaginationBar

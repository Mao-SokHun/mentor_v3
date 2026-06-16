import { useState } from 'react'
import { Eye, Pencil, Save, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import Button from '../../ui/Button'
import { PageScaffold, TabBar } from '@/components'
import { useTranslation } from '@/i18n'

const AdminContentShell = ({
  title,
  subtitle,
  previewHref,
  preview,
  editor,
  onSave,
  saving = false,
  savedAt,
}) => {
  const { t } = useTranslation()
  const [mode, setMode] = useState('preview')

  return (
    <PageScaffold
      title={title}
      subtitle={subtitle}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {previewHref && (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600"
            >
              {t('adminContent.viewPublic')}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {mode === 'edit' && (
            <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? t('adminContent.saving') : t('adminContent.save')}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <TabBar
          tabs={[
            { id: 'preview', label: t('adminContent.preview') },
            { id: 'edit', label: t('adminContent.edit') },
          ]}
          active={mode}
          onChange={setMode}
        />
        {savedAt && (
          <p className="text-xs text-emerald-600 font-medium">{t('adminContent.saved')}</p>
        )}
      </div>

      <div
        className={clsx(
          'rounded-2xl border transition-colors',
          mode === 'edit'
            ? 'border-primary-200/80 bg-primary-50/30 p-1'
            : 'border-transparent'
        )}
      >
        {mode === 'preview' ? (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {t('adminContent.previewHint')}
            </p>
            {preview}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wide px-2 pt-2 flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              {t('adminContent.editHint')}
            </p>
            <div className="p-3 sm:p-4">{editor}</div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">{t('adminContent.backendHint')}</p>
    </PageScaffold>
  )
}

export default AdminContentShell

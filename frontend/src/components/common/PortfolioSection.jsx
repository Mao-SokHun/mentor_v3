import { useMemo, useState } from 'react'
import { Plus, X, ExternalLink, Edit2, Check, Link2, FileText, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import PageCard from './PageCard'
import MentorProfileSectionHeader from './MentorProfileSectionHeader'
import { useTranslation } from '@/i18n'
import { isApiEnabled } from '@/constants'
import { deletePortfolioFile } from '@/services/mentors/mentorService'
import {
  detectPortfolioLinkKind,
  portfolioKindMeta,
  portfolioDisplayTitle,
  portfolioDisplaySubtitle,
  suggestPortfolioTitle,
  isValidPortfolioUrl,
  invalidPortfolioLinks,
  classifyPortfolioEntryMode,
} from '@/utils/portfolioUtils'

const ITEM_TYPES = ['link', 'project', 'certificate', 'achievement']
const ACCEPT_FILES = '.pdf,.png,.jpg,.jpeg,.webp'

const inputClass =
  'w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300'

const PORTFOLIO_PRESETS = [
  { key: 'github', prefix: 'https://github.com/' },
  { key: 'linkedin', prefix: 'https://www.linkedin.com/in/' },
]

function PortfolioDisplayRow({ item, t }) {
  const link = String(item.link ?? '').trim()
  const kind = detectPortfolioLinkKind(link)
  const { Icon, color } = portfolioKindMeta(kind)
  const title = portfolioDisplayTitle(item)
  const sub = portfolioDisplaySubtitle(item)
  const [bgClass, iconClass] = color.split(' ')
  const techs = String(item.technologies ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  const files = item.files ?? []

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgClass)}>
        <Icon className={clsx('w-5 h-5', iconClass)} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{title}</p>
        {item.portfolioDate ? (
          <p className="text-xs text-teal-700 font-medium mt-0.5">{item.portfolioDate}</p>
        ) : null}
        {sub && sub !== title ? (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
        ) : null}
        {item.description ? (
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">{item.description}</p>
        ) : null}
        {techs.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {techs.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {files.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {files.map((file) => (
              <li key={file.file_id ?? file.url}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
                >
                  <FileText className="w-3 h-3" />
                  {file.file_name || file.url}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 rounded-lg border border-teal-200/80 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 no-underline hover:bg-teal-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3 shrink-0" aria-hidden />
            {t('mentorProfile.portfolioOpenLink')}
          </a>
        ) : null}
      </div>
    </div>
  )
}

function portfolioItemHasExtraDetails(item) {
  return (
    String(item.description ?? '').trim() ||
    String(item.portfolioDate ?? '').trim() ||
    String(item.technologies ?? '').trim() ||
    (item.itemType && item.itemType !== 'link')
  )
}

function PortfolioFileField({ item, onUpdate, onDeleteFile, t }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
        <FileText className="w-3.5 h-3.5 shrink-0" />
        {t('mentorProfile.portfolioFileLabel')}
      </label>
      <input
        type="file"
        accept={ACCEPT_FILES}
        onChange={(e) => onUpdate(item.id, 'pendingFile', e.target.files?.[0] ?? null)}
        className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-teal-700"
      />
      <p className="mt-1 text-[11px] text-slate-500">{t('mentorProfile.portfolioFileHint')}</p>
      {item.pendingFile ? (
        <p className="mt-1 text-[11px] font-medium text-teal-700">
          {t('mentorProfile.portfolioFileSelected')}: {item.pendingFile.name}
        </p>
      ) : null}
      {(item.files ?? []).length > 0 ? (
        <ul className="mt-2 space-y-1">
          {(item.files ?? []).map((file) => (
            <li key={file.file_id ?? file.url} className="flex items-center justify-between gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-teal-700 hover:underline truncate"
              >
                {file.file_name || file.url}
              </a>
              {onDeleteFile ? (
                <button
                  type="button"
                  onClick={() => onDeleteFile(item, file)}
                  className="text-xs text-red-500 hover:text-red-600 shrink-0"
                >
                  {t('mentorProfile.portfolioRemoveFile')}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function partitionPortfolioItems(items = []) {
  const links = []
  const documents = []
  for (const item of items) {
    const mode = classifyPortfolioEntryMode(item)
    if (mode === 'document') documents.push({ ...item, entryMode: 'document' })
    else links.push({ ...item, entryMode: 'link' })
  }
  return { links, documents }
}

function portfolioRowSummary(rows, t) {
  const labels = rows
    .filter(
      (item) =>
        String(item.title ?? '').trim() ||
        String(item.link ?? '').trim() ||
        item.pendingFile ||
        (item.files?.length ?? 0) > 0
    )
    .map((item) => String(item.title ?? '').trim() || portfolioDisplayTitle(item))
    .filter(Boolean)
  return labels.length ? labels.join(' · ') : t('mentorProfile.portfolioSectionEmpty')
}

function CollapsiblePortfolioPanel({ icon: Icon, title, count, open, onToggle, summary, children, compact }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          'flex w-full items-center gap-1.5 text-left bg-slate-50 hover:bg-slate-100 transition-colors',
          compact ? 'px-2 py-1.5' : 'px-3 py-2.5 gap-2'
        )}
      >
        <Icon
          className={clsx('shrink-0 text-slate-500', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')}
          strokeWidth={2}
        />
        <span className="text-sm font-semibold text-slate-800">
          {title}
        </span>
        {count > 0 ? (
          <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-xs font-bold text-teal-700">
            {count}
          </span>
        ) : null}
        {!compact ? (
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400 text-right">{summary}</span>
        ) : null}
        <ChevronDown
          className={clsx(
            'shrink-0 text-slate-400 transition-transform ml-auto',
            compact ? 'w-3.5 h-3.5' : 'w-4 h-4',
            open && 'rotate-180'
          )}
        />
      </button>
      {open ? (
        <div className={clsx('border-t border-slate-100 space-y-1.5', compact ? 'p-2' : 'p-3 space-y-2')}>
          {children}
        </div>
      ) : null}
    </div>
  )
}

function PortfolioLinkRow({ item, onUpdate, onRemove, t, compact }) {
  const linkValue = String(item.link ?? '').trim()
  const showInvalid = linkValue && !isValidPortfolioUrl(linkValue)
  return (
    <div className={clsx('rounded-lg border border-slate-100 bg-slate-50', compact ? 'p-2' : 'p-2.5')}>
      <div
        className={clsx(
          'grid gap-2 items-end',
          compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]'
        )}
      >
        <div>
          <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
            {t('mentorProfile.portfolioTitleLabel')}
          </label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
            placeholder={t('mentorProfile.portfolioTitlePlaceholder')}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
            {t('mentorProfile.portfolioUrlLabel')}
          </label>
          <div className="flex gap-1.5">
            <input
              type="url"
              value={item.link}
              onChange={(e) => onUpdate(item.id, 'link', e.target.value)}
              placeholder={t('mentorProfile.portfolioPlaceholder')}
              className={clsx(inputClass, showInvalid && 'border-red-300')}
            />
            {isValidPortfolioUrl(item.link) ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-teal-600"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
          {showInvalid ? (
            <p className="mt-0.5 text-[10px] text-red-500">{t('mentorProfile.portfolioInvalidUrl')}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function PortfolioDocumentRow({ item, onUpdate, onRemove, onDeleteFile, expandedIds, onToggleDetails, t, compact }) {
  const showExtra = expandedIds.has(item.id) || portfolioItemHasExtraDetails(item)
  return (
    <div className={clsx('rounded-lg border border-slate-100 bg-slate-50 space-y-2', compact ? 'p-2' : 'p-2.5')}>
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
            {t('mentorProfile.portfolioDocTitleLabel')}
          </label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
            placeholder={t('mentorProfile.portfolioDocTitlePlaceholder')}
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <PortfolioFileField item={item} onUpdate={onUpdate} onDeleteFile={onDeleteFile} t={t} />
      <button
        type="button"
        onClick={() => onToggleDetails(item.id)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-teal-700"
      >
        <ChevronDown className={clsx('w-3 h-3 transition-transform', showExtra && 'rotate-180')} />
        {showExtra ? t('mentorProfile.portfolioHideDetails') : t('mentorProfile.portfolioDocMoreDetails')}
      </button>
      {showExtra ? (
        <textarea
          rows={2}
          value={item.description ?? ''}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          placeholder={t('mentorProfile.portfolioDescriptionPlaceholder')}
          className={clsx(inputClass, 'resize-y min-h-[48px]')}
        />
      ) : null}
    </div>
  )
}

function PortfolioSplitForm({
  items,
  onChange,
  onDeleteFile,
  expandedIds,
  onToggleDetails,
  t,
  compact = false,
}) {
  const { links, documents } = partitionPortfolioItems(items)
  const [linksOpen, setLinksOpen] = useState(() =>
    compact ? false : links.some((r) => String(r.link ?? '').trim() || r.title)
  )
  const [docsOpen, setDocsOpen] = useState(() =>
    compact
      ? false
      : documents.some((r) => r.title || r.pendingFile || (r.files?.length ?? 0) > 0)
  )

  const emit = (nextLinks, nextDocs) => onChange?.([...nextLinks, ...nextDocs])

  const updateIn = (subset, id, field, value) =>
    subset.map((item) => {
      if (item.id !== id) return item
      const next = { ...item, [field]: value }
      if (field === 'link' && value.trim() && !item.title?.trim()) {
        const suggested = suggestPortfolioTitle(value)
        if (suggested) next.title = suggested
      }
      if (field === 'pendingFile') next.pendingFile = value
      return next
    })

  const handleLinkUpdate = (id, field, value) => emit(updateIn(links, id, field, value), documents)
  const handleDocUpdate = (id, field, value) => emit(links, updateIn(documents, id, field, value))
  const removeLink = (id) => emit(links.filter((r) => r.id !== id), documents)
  const removeDoc = (id) => emit(links, documents.filter((r) => r.id !== id))

  const addLink = (prefix = '') => {
    const row = {
      id: Date.now(),
      entryMode: 'link',
      link: prefix,
      title: prefix ? suggestPortfolioTitle(prefix) : '',
      itemType: 'link',
      files: [],
      pendingFile: null,
    }
    emit([...links, row], documents)
    setLinksOpen(true)
  }

  const addDocument = () => {
    const row = {
      id: Date.now(),
      entryMode: 'document',
      link: '',
      title: '',
      itemType: 'certificate',
      files: [],
      pendingFile: null,
    }
    emit(links, [...documents, row])
    setDocsOpen(true)
  }

  const filledLinkCount = links.filter((r) => String(r.link ?? '').trim() || String(r.title ?? '').trim()).length
  const filledDocCount = documents.filter(
    (r) => r.title || r.pendingFile || (r.files?.length ?? 0) > 0
  ).length

  return (
    <div className="space-y-2">
      <CollapsiblePortfolioPanel
        icon={Link2}
        title={t('mentorProfile.portfolioLinksSection')}
        count={filledLinkCount}
        open={linksOpen}
        onToggle={() => setLinksOpen((v) => !v)}
        summary={portfolioRowSummary(links, t)}
        compact={compact}
      >
        {!compact ? (
          <div className="flex flex-wrap gap-1.5">
            {PORTFOLIO_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => addLink(preset.prefix)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-teal-200 hover:text-teal-700"
              >
                <Plus className="w-3 h-3" />
                {t(`mentorProfile.portfolioPreset_${preset.key}`)}
              </button>
            ))}
          </div>
        ) : null}
        {links.map((item) => (
          <PortfolioLinkRow
            key={item.id}
            item={item}
            onUpdate={handleLinkUpdate}
            onRemove={removeLink}
            t={t}
            compact={compact}
          />
        ))}
        <button
          type="button"
          onClick={() => addLink()}
          className={clsx(
            'w-full rounded-lg border border-dashed border-slate-200 font-semibold text-teal-600 hover:bg-teal-50/50',
            compact ? 'py-1 text-[11px]' : 'py-1.5 text-xs'
          )}
        >
          + {t('mentorProfile.addPortfolioLink')}
        </button>
      </CollapsiblePortfolioPanel>

      <CollapsiblePortfolioPanel
        icon={FileText}
        title={t('mentorProfile.portfolioDocumentsSection')}
        count={filledDocCount}
        open={docsOpen}
        onToggle={() => setDocsOpen((v) => !v)}
        summary={portfolioRowSummary(documents, t)}
        compact={compact}
      >
        {documents.map((item) => (
          <PortfolioDocumentRow
            key={item.id}
            item={item}
            onUpdate={handleDocUpdate}
            onRemove={removeDoc}
            onDeleteFile={onDeleteFile}
            expandedIds={expandedIds}
            onToggleDetails={onToggleDetails}
            t={t}
            compact={compact}
          />
        ))}
        <button
          type="button"
          onClick={addDocument}
          className={clsx(
            'w-full rounded-lg border border-dashed border-slate-200 font-semibold text-teal-600 hover:bg-teal-50/50',
            compact ? 'py-1 text-[11px]' : 'py-1.5 text-xs'
          )}
        >
          + {t('mentorProfile.addPortfolioDocument')}
        </button>
      </CollapsiblePortfolioPanel>
    </div>
  )
}

const PortfolioSection = ({
  items = [],
  onChange,
  readOnly = false,
  alwaysEdit = false,
  splitLinksAndDocs = false,
  userId = null,
  className,
  embedded = false,
  showHeader = true,
  compact = false,
}) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(items)
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const toggleDetails = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isFormMode = alwaysEdit && !readOnly
  const isEditing = isFormMode || editing
  const activeRows = isFormMode ? items : isEditing ? draft : items

  const invalidRows = useMemo(() => {
    const list = isFormMode ? items : isEditing ? draft : items
    const linkOnly = splitLinksAndDocs
      ? list.filter((item) => classifyPortfolioEntryMode(item) === 'link')
      : list
    return invalidPortfolioLinks(linkOnly)
  }, [isFormMode, isEditing, items, draft, splitLinksAndDocs])

  const hasPortfolioContent = (item) =>
    String(item.link ?? '').trim() ||
    String(item.title ?? '').trim() ||
    String(item.description ?? '').trim() ||
    (item.files?.length ?? 0) > 0

  const displayItems = useMemo(
    () => activeRows.filter(hasPortfolioContent),
    [activeRows]
  )

  const emptyRow = () => ({
    id: Date.now(),
    link: '',
    title: '',
    description: '',
    portfolioDate: '',
    technologies: '',
    itemType: 'link',
    files: [],
    pendingFile: null,
  })

  const startEdit = () => {
    setDraft(items.length ? items : [emptyRow()])
    setEditing(true)
  }

  const confirm = () => {
    onChange?.(draft.filter(hasPortfolioContent))
    setEditing(false)
  }

  const cancel = () => {
    setDraft(items)
    setEditing(false)
  }

  const updateItem = (id, field, value) => {
    const apply = (prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (field === 'link' && value.trim() && !item.title?.trim()) {
          const suggested = suggestPortfolioTitle(value)
          if (suggested) next.title = suggested
        }
        if (field === 'pendingFile') {
          next.pendingFile = value
        }
        return next
      })

    if (isFormMode) {
      onChange?.(apply(items))
      return
    }
    setDraft(apply)
  }

  const removeItem = (id) => {
    if (isFormMode) {
      onChange?.(items.filter((item) => item.id !== id))
      return
    }
    setDraft((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDeleteFile = async (item, file) => {
    if (!onChange) return
    const removeLocal = () => {
      const apply = (list) =>
        list.map((row) =>
          row.id === item.id
            ? { ...row, files: (row.files ?? []).filter((f) => f.file_id !== file.file_id) }
            : row
        )
      if (isFormMode) onChange(apply(items))
      else setDraft(apply)
    }
    if (!isApiEnabled() || !userId || !file.file_id || !item.link) {
      removeLocal()
      return
    }
    try {
      await deletePortfolioFile(userId, item.link, file.file_id)
      removeLocal()
    } catch {
      /* keep UI unchanged on failure */
    }
  }

  const addItem = () => {
    const row = emptyRow()
    if (isFormMode) {
      onChange?.([...items, row])
      return
    }
    setDraft((prev) => [...prev, row])
    if (!editing) setEditing(true)
  }

  const addPreset = (prefix) => {
    const row = {
      ...emptyRow(),
      link: prefix,
      title: suggestPortfolioTitle(prefix),
    }
    if (isFormMode) {
      onChange?.([...items, row])
      return
    }
    setDraft((prev) => [...prev, row])
    if (!editing) setEditing(true)
  }

  const editActions =
    !readOnly && !isFormMode ? (
      <div className="flex items-center gap-2 shrink-0">
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> {t('mentorProfile.editExperience')}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={confirm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> {t('mentorProfile.confirmExperience')}
            </button>
            <button
              type="button"
              onClick={cancel}
              aria-label={t('profile.cancel')}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    ) : null

  const body = readOnly ? (
    displayItems.length === 0 ? (
      <p className="text-sm text-slate-500 text-center py-6 px-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        {t('mentorProfile.portfolioEmptyHint')}
      </p>
    ) : (
      <div className="space-y-3">
        {displayItems.map((item) => (
          <PortfolioDisplayRow key={item.id ?? item.link} item={item} t={t} />
        ))}
      </div>
    )
  ) : splitLinksAndDocs ? (
    <>
      <PortfolioSplitForm
        items={activeRows}
        onChange={onChange}
        onDeleteFile={userId ? handleDeleteFile : null}
        expandedIds={expandedIds}
        onToggleDetails={toggleDetails}
        t={t}
        compact={compact}
      />
      {invalidRows.length > 0 ? (
        <p className="mt-2 text-xs text-red-500">{t('mentorProfile.portfolioInvalidUrlHint')}</p>
      ) : null}
    </>
  ) : (
    <>
      <p className="text-xs text-slate-500 mb-2">{t('mentorProfile.portfolioHint')}</p>
      <div className="space-y-2">
        {activeRows.map((item) => (
          <PortfolioLinkRow
            key={item.id}
            item={item}
            onUpdate={updateItem}
            onRemove={removeItem}
            t={t}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700"
      >
        + {t('mentorProfile.addPortfolioLink')}
      </button>
      {invalidRows.length > 0 ? (
        <p className="mt-2 text-xs text-red-500">{t('mentorProfile.portfolioInvalidUrlHint')}</p>
      ) : null}
    </>
  )

  if (embedded) {
    return (
      <div className={className}>
        {showHeader ? (
          compact ? (
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link2 className="w-3.5 h-3.5 shrink-0 text-slate-500" strokeWidth={2} />
                <h2 className="text-sm font-semibold text-slate-800 truncate">{t('mentorProfile.portfolio')}</h2>
              </div>
              {editActions}
            </div>
          ) : (
            <MentorProfileSectionHeader
              icon={Link2}
              title={t('mentorProfile.portfolio')}
              action={editActions}
            />
          )
        ) : null}
        {body}
      </div>
    )
  }

  return (
    <PageCard className={clsx('border border-slate-200/80 shadow-sm', className)}>
      <MentorProfileSectionHeader icon={Link2} title={t('mentorProfile.portfolio')} action={editActions} />
      <div className="p-4 sm:p-5">{body}</div>
    </PageCard>
  )
}

export default PortfolioSection

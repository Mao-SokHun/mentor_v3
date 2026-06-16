import {
  formatMentorDisplayName,
  mentorNamesDbToUi,
  parseMentorDescription,
} from '@/lib/mentorApiMap'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import {
  getPostSessionDate,
  getPostStatusLabel,
  getPostSubjectLabel,
} from '@/utils/analyticsFilterUtils'
import { containsKhmerScript } from '@/utils/khmerTextUtils'

const KHMER_FONT = 'Khmer OS Siemreap'

export const KH_EXPORT_HEADER = {
  kingdom: 'ព្រះរាជាណាចក្រកម្ពុជា',
  motto: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
}

export const PLATFORM_EXPORT = {
  nameEn: 'Rokkru',
  nameKm: 'Rokkru',
}

export function resolveMentorExportIdentity(mentorRow, user) {
  const row = mentorRow ?? {}
  const base = user ?? {}
  const { firstName, lastName } = mentorNamesDbToUi(row, base)
  const parsed = parseMentorDescription(row.description ?? '')
  const title = String(parsed.title ?? '').trim()

  const nameKm =
    formatMentorDisplayName({ firstName, lastName }, { familyFirst: true }) ||
    String(base.name ?? '').trim() ||
    '—'
  const nameEn =
    formatMentorDisplayName({ firstName, lastName }, { familyFirst: false }) ||
    String(base.name ?? '').trim() ||
    '—'

  return { nameKm, nameEn, title }
}

function escapeCsvCell(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function stamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

export function postsToExportRows(posts = [], statusLabels = {}) {
  return posts.map((post) => {
    const meta = parsePostScheduleMeta(post.description)
    const statusKey = getPostStatusLabel(post)
    const sessionDate = getPostSessionDate(post)
    return {
      sessionDate: meta.date || (sessionDate ? sessionDate.toISOString().slice(0, 10) : ''),
      time: meta.time || '',
      subject: getPostSubjectLabel(post),
      status: statusLabels[statusKey] || statusKey,
    }
  })
}

export function buildAnalyticsExportPayload({
  posts = [],
  summary = {},
  filters = {},
  labels = {},
  statusLabels = {},
  mentor = {},
  platform = PLATFORM_EXPORT,
  header = KH_EXPORT_HEADER,
  reportPeriod = '',
  periodLabel = '',
}) {
  const rows = postsToExportRows(posts, statusLabels)
  const generatedAt = new Date().toLocaleString()
  const titleBase = labels.reportTitle || 'Teaching Report'
  const title = periodLabel ? `${titleBase} — ${periodLabel}` : titleBase

  return {
    title,
    reportPeriod,
    periodLabel,
    generatedAt,
    header,
    platform: {
      nameEn: platform.nameEn ?? PLATFORM_EXPORT.nameEn,
      nameKm: platform.nameKm ?? PLATFORM_EXPORT.nameKm,
    },
    mentor: {
      nameKm: mentor.nameKm ?? '—',
      nameEn: mentor.nameEn ?? '—',
      title: mentor.title ?? '',
    },
    labels: {
      kingdom: labels.kingdom || KH_EXPORT_HEADER.kingdom,
      motto: labels.motto || KH_EXPORT_HEADER.motto,
      platform: labels.platform || 'Platform',
      mentorName: labels.mentorName || 'Teacher',
      mentorNameKm: labels.mentorNameKm || 'ឈ្មោះគ្រូ (ខ្មែរ)',
      mentorNameEn: labels.mentorNameEn || 'Teacher name (English)',
      generated: labels.generated || 'Generated',
      noSessions: labels.noSessions || 'No sessions',
      sessionsSheet: labels.sessionsSheet || 'Sessions',
      summaryTotalPosts: labels.summaryTotalPosts || 'Total posts',
      summaryDetailViews: labels.summaryDetailViews || 'Detail clicks',
      summaryActiveSessions: labels.summaryActiveSessions || 'Active sessions',
      summaryAvgPerWeek: labels.summaryAvgPerWeek || 'Avg / week',
      filterDate: labels.filterDate || 'Date range',
      filterPeriod: labels.filterPeriod || 'Report period',
      filterSubject: labels.filterSubject || 'Subject',
      filterStatus: labels.filterStatus || 'Status',
    },
    filters: {
      dateRange: filters.dateRangeLabel || '',
      period: filters.periodLabel || '',
      subject: filters.subjectLabel || '',
      status: filters.statusLabel || '',
    },
    periodStamp: filters.periodStamp || '',
    summary: {
      totalPosts: summary.totalPosts ?? 0,
      detailViews: summary.detailViews ?? 0,
      activeSessions: summary.activeSessions ?? 0,
      avgPerWeek: summary.avgPerWeek ?? 0,
    },
    columns: [
      { key: 'sessionDate', header: labels.colDate || 'Date' },
      { key: 'time', header: labels.colTime || 'Time' },
      { key: 'subject', header: labels.colSubject || 'Subject' },
      { key: 'status', header: labels.colStatus || 'Status' },
    ],
    rows,
  }
}

function exportHeaderLines(payload) {
  return [
    payload.header?.kingdom || KH_EXPORT_HEADER.kingdom,
    payload.header?.motto || KH_EXPORT_HEADER.motto,
    '',
    `${payload.platform?.nameKm ?? PLATFORM_EXPORT.nameKm} / ${payload.platform?.nameEn ?? PLATFORM_EXPORT.nameEn}`,
    `${payload.labels?.mentorNameKm || 'ឈ្មោះគ្រូ (ខ្មែរ)'}: ${payload.mentor?.nameKm ?? '—'}`,
    `${payload.labels?.mentorNameEn || 'Teacher name (English)'}: ${payload.mentor?.nameEn ?? '—'}`,
    '',
    payload.title,
    `${payload.labels?.generated || 'Generated'}: ${payload.generatedAt}`,
  ]
}

export function exportAnalyticsCsv(payload) {
  const lines = exportHeaderLines(payload).map((line) => escapeCsvCell(line))
  lines.push('')
  lines.push(
    [
      payload.labels?.summaryTotalPosts || 'Total posts',
      payload.labels?.summaryDetailViews || 'Detail clicks',
      payload.labels?.summaryActiveSessions || 'Active sessions',
      payload.labels?.summaryAvgPerWeek || 'Avg / week',
    ]
      .map(escapeCsvCell)
      .join(',')
  )
  lines.push(
    [
      payload.summary.totalPosts,
      payload.summary.detailViews,
      payload.summary.activeSessions,
      payload.summary.avgPerWeek,
    ]
      .map(escapeCsvCell)
      .join(',')
  )
  lines.push('')
  lines.push(
    [
      payload.labels?.filterDate || 'Date range',
      payload.labels?.filterSubject || 'Subject',
      payload.labels?.filterStatus || 'Status',
    ]
      .map(escapeCsvCell)
      .join(',')
  )
  lines.push(
    [payload.filters.dateRange, payload.filters.subject, payload.filters.status]
      .map(escapeCsvCell)
      .join(',')
  )
  lines.push('')
  lines.push(payload.columns.map((c) => escapeCsvCell(c.header)).join(','))
  for (const row of payload.rows) {
    lines.push(payload.columns.map((c) => escapeCsvCell(row[c.key])).join(','))
  }

  const bom = '\uFEFF'
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(`rokkru-report-${stamp()}.csv`, blob)
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function xmlFontStyle(id, { size = 11, bold = false, center = false } = {}) {
  const weight = bold ? ' ss:Bold="1"' : ''
  const align = center
    ? '<Alignment ss:Horizontal="Center" ss:Vertical="Top"/>'
    : '<Alignment ss:Vertical="Top"/>'
  return `<Style ss:ID="${id}">
    <Font ss:FontName="${KHMER_FONT}" ss:Size="${size}"${weight}/>
    ${align}
    <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>`
}

function xmlCell(value, styleId, mergeAcross = 0) {
  const merge = mergeAcross > 0 ? ` ss:MergeAcross="${mergeAcross}"` : ''
  return `<Cell ss:StyleID="${styleId}"${merge}><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`
}

function xmlRow(cells) {
  return `<Row>${cells}</Row>`
}

function xmlMergedRow(text, styleId, colCount) {
  return xmlRow(xmlCell(text, styleId, Math.max(0, colCount - 1)))
}

function xmlLabelValueRow(label, value, labelStyle, valueStyle, colCount) {
  return xmlRow(
    xmlCell(label, labelStyle) + xmlCell(value, valueStyle, Math.max(0, colCount - 2))
  )
}

function xmlBlankRow(colCount) {
  return xmlMergedRow('', 'sDefault', colCount)
}

function cellStyleFor(text, { bold = false, center = false, size = 11 } = {}) {
  const kh = containsKhmerScript(text)
  if (size >= 16) return center ? 'sKh16Center' : 'sKh16'
  if (size >= 14) return center ? 'sKh14Center' : 'sKh14'
  if (size >= 13) return center ? 'sKh13Center' : 'sKh13'
  if (bold) return kh ? 'sKhBold' : 'sBold'
  return 'sDefault'
}

/** Excel SpreadsheetML — preserves Khmer OS Siemreap font in Microsoft Excel. */
function buildExportSpreadsheetXml(payload) {
  const colCount = Math.max(payload.columns.length, 4)
  const rows = []

  rows.push(
    xmlMergedRow(
      payload.header?.kingdom || KH_EXPORT_HEADER.kingdom,
      'sKh16Center',
      colCount
    )
  )
  rows.push(
    xmlMergedRow(payload.header?.motto || KH_EXPORT_HEADER.motto, 'sKh13Center', colCount)
  )
  rows.push(xmlBlankRow(colCount))

  rows.push(
    xmlMergedRow(
      `${payload.platform?.nameKm ?? PLATFORM_EXPORT.nameKm} / ${payload.platform?.nameEn ?? PLATFORM_EXPORT.nameEn}`,
      'sKh14Center',
      colCount
    )
  )
  rows.push(xmlBlankRow(colCount))

  rows.push(
    xmlLabelValueRow(
      payload.labels?.mentorNameKm || 'ឈ្មោះគ្រូ (ខ្មែរ)',
      payload.mentor?.nameKm ?? '—',
      'sKhBold',
      cellStyleFor(payload.mentor?.nameKm ?? ''),
      colCount
    )
  )
  rows.push(
    xmlLabelValueRow(
      payload.labels?.mentorNameEn || 'Teacher name (English)',
      payload.mentor?.nameEn ?? '—',
      'sBold',
      'sDefault',
      colCount
    )
  )
  rows.push(xmlBlankRow(colCount))

  rows.push(xmlMergedRow(payload.title, cellStyleFor(payload.title, { bold: true, size: 13 }), colCount))
  rows.push(
    xmlMergedRow(
      `${payload.labels?.generated || 'Generated'}: ${payload.generatedAt}`,
      cellStyleFor(payload.generatedAt),
      colCount
    )
  )
  rows.push(xmlBlankRow(colCount))

  const summaryRows = [
    [payload.labels?.summaryTotalPosts || 'Total posts', payload.summary.totalPosts],
    [payload.labels?.summaryDetailViews || 'Detail clicks', payload.summary.detailViews],
    [payload.labels?.summaryActiveSessions || 'Active sessions', payload.summary.activeSessions],
    [payload.labels?.summaryAvgPerWeek || 'Avg / week', payload.summary.avgPerWeek],
  ]
  for (const [label, value] of summaryRows) {
    rows.push(
      xmlLabelValueRow(label, String(value), cellStyleFor(label, { bold: true }), 'sDefault', colCount)
    )
  }
  rows.push(xmlBlankRow(colCount))

  const filterRows = [
    [
      payload.labels?.filterPeriod || 'Report period',
      payload.filters.period || payload.periodLabel || '—',
    ],
    [payload.labels?.filterSubject || 'Subject', payload.filters.subject || '—'],
    [payload.labels?.filterStatus || 'Status', payload.filters.status || '—'],
  ]
  for (const [label, value] of filterRows) {
    rows.push(
      xmlLabelValueRow(
        label,
        String(value),
        cellStyleFor(label, { bold: true }),
        cellStyleFor(value),
        colCount
      )
    )
  }
  rows.push(xmlBlankRow(colCount))

  rows.push(
    xmlRow(payload.columns.map((c) => xmlCell(c.header, cellStyleFor(c.header, { bold: true }))).join(''))
  )

  if (payload.rows.length === 0) {
    rows.push(
      xmlMergedRow(payload.labels?.noSessions || 'No sessions', 'sDefault', colCount)
    )
  } else {
    for (const row of payload.rows) {
      rows.push(
        xmlRow(
          payload.columns
            .map((c) => xmlCell(row[c.key], cellStyleFor(row[c.key])))
            .join('')
        )
      )
    }
  }

  const styles = [
    xmlFontStyle('sDefault', { size: 11 }),
    xmlFontStyle('sBold', { size: 11, bold: true }),
    xmlFontStyle('sKhBold', { size: 11, bold: true }),
    xmlFontStyle('sKh13', { size: 13 }),
    xmlFontStyle('sKh13Center', { size: 13, center: true }),
    xmlFontStyle('sKh14', { size: 14 }),
    xmlFontStyle('sKh14Center', { size: 14, center: true, bold: true }),
    xmlFontStyle('sKh16', { size: 16, bold: true }),
    xmlFontStyle('sKh16Center', { size: 16, bold: true, center: true }),
  ].join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Rokkru</Author>
  </DocumentProperties>
  <Styles>
    ${styles}
  </Styles>
  <Worksheet ss:Name="Report">
    <Table ss:DefaultColumnWidth="120">
      ${rows.join('\n')}
    </Table>
  </Worksheet>
</Workbook>`
}

export function exportAnalyticsXls(payload) {
  const xml = buildExportSpreadsheetXml(payload)
  const bom = '\uFEFF'
  const blob = new Blob([bom + xml], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const periodPart = payload.reportPeriod ? `${payload.reportPeriod}-` : ''
  const stampPart = payload.periodStamp || stamp()
  downloadBlob(`rokkru-report-${periodPart}${stampPart}.xls`, blob)
}

/** Full report — same as XLS with richer layout */
export function exportAnalyticsReport(payload) {
  exportAnalyticsXls(payload)
}

/** Sessions-only quick CSV */
export function exportSessionsCsv(payload) {
  const lines = [payload.columns.map((c) => escapeCsvCell(c.header)).join(',')]
  for (const row of payload.rows) {
    lines.push(payload.columns.map((c) => escapeCsvCell(row[c.key])).join(','))
  }
  const bom = '\uFEFF'
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(`rokkru-sessions-${stamp()}.csv`, blob)
}

/** Sessions-only quick XLS */
export function exportSessionsXls(payload) {
  const slim = {
    ...payload,
    title: payload.labels?.sessionsSheet || 'Sessions',
  }
  exportAnalyticsXls(slim)
}

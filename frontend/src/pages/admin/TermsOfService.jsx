import { useState, useEffect } from 'react'
import { usePlatformContent } from '@/contexts/PlatformContentContext'
import { useTranslation } from '@/i18n'
import AdminContentShell from '../../components/admin/content/AdminContentShell'
import LegalSectionsEditor from '../../components/admin/content/LegalSectionsEditor'
import LegalContentPreview from '../../components/admin/content/LegalContentPreview'

const TermsOfService = () => {
  const { t } = useTranslation()
  const { termsSections, saveTerms, saving, savedAt } = usePlatformContent()
  const [draft, setDraft] = useState(termsSections)

  useEffect(() => {
    setDraft(termsSections)
  }, [termsSections])

  return (
    <AdminContentShell
      title={t('admin.termsOfService')}
      subtitle={t('adminContent.termsSubtitle')}
      previewHref="/terms"
      saving={saving === 'terms'}
      savedAt={savedAt}
      onSave={() => saveTerms({ sections: draft })}
      preview={<LegalContentPreview sections={termsSections} />}
      editor={<LegalSectionsEditor sections={draft} onChange={setDraft} />}
    />
  )
}

export default TermsOfService

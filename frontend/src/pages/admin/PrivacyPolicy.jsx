import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { PageCard } from '@/components'
import { usePlatformContent } from '@/contexts/PlatformContentContext'
import { useTranslation } from '@/i18n'
import AdminContentShell from '../../components/admin/content/AdminContentShell'
import LegalSectionsEditor from '../../components/admin/content/LegalSectionsEditor'
import LegalContentPreview from '../../components/admin/content/LegalContentPreview'

const PrivacyPolicy = () => {
  const { t } = useTranslation()
  const { privacySections, savePrivacy, saving, savedAt } = usePlatformContent()
  const [draft, setDraft] = useState(privacySections)

  useEffect(() => {
    setDraft(privacySections)
  }, [privacySections])

  return (
    <AdminContentShell
      title={t('admin.privacyPolicy')}
      subtitle={t('adminContent.privacySubtitle')}
      previewHref="/privacy"
      saving={saving === 'privacy'}
      savedAt={savedAt}
      onSave={() => savePrivacy({ sections: draft })}
      preview={
        <div className="space-y-5">
          <PageCard className="bg-primary-50 border-primary-100 flex items-center gap-3">
            <Lock className="w-5 h-5 text-primary-500 flex-shrink-0" />
            <p className="text-sm text-primary-700">{t('legal.trustNote')}</p>
          </PageCard>
          <LegalContentPreview sections={privacySections} />
        </div>
      }
      editor={<LegalSectionsEditor sections={draft} onChange={setDraft} />}
    />
  )
}

export default PrivacyPolicy

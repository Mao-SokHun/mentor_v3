import { LegalDocumentInAppPage } from '@/components/common/LegalDocumentPage'
import { usePlatformContent } from '@/contexts/PlatformContentContext'

const PrivacyInApp = () => {
  const { privacySections: sections } = usePlatformContent()
  return <LegalDocumentInAppPage kind="privacy" sections={sections} />
}

export default PrivacyInApp

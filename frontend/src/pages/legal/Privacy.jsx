import { LegalDocumentPublicPage } from '@/components/common/LegalDocumentPage'
import { usePlatformContent } from '@/contexts/PlatformContentContext'

const Privacy = () => {
  const { privacySections: sections } = usePlatformContent()
  return <LegalDocumentPublicPage kind="privacy" sections={sections} />
}

export default Privacy

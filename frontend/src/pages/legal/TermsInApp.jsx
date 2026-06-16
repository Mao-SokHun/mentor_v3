import { LegalDocumentInAppPage } from '@/components/common/LegalDocumentPage'
import { usePlatformContent } from '@/contexts/PlatformContentContext'

const TermsInApp = () => {
  const { termsSections: sections } = usePlatformContent()
  return <LegalDocumentInAppPage kind="terms" sections={sections} />
}

export default TermsInApp

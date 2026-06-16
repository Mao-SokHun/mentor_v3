import { LegalDocumentPublicPage } from '@/components/common/LegalDocumentPage'
import { usePlatformContent } from '@/contexts/PlatformContentContext'

const Terms = () => {
  const { termsSections: sections } = usePlatformContent()
  return <LegalDocumentPublicPage kind="terms" sections={sections} />
}

export default Terms

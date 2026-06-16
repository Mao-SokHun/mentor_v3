import { PageAmbient } from '@/components'
import { ContactForm as ContactPageContent } from '@/components'
import { useAuth } from '@/hooks'

const ContactInApp = () => {
  const { user } = useAuth()
  const ambientVariant = user?.role === 'mentor' ? 'mentor' : 'ambient'

  return (
    <PageAmbient variant={ambientVariant} className="space-y-6">
      <div className="max-w-4xl mx-auto w-full">
        <ContactPageContent />
      </div>
    </PageAmbient>
  )
}

export default ContactInApp

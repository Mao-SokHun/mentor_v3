import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import clsx from 'clsx'
import { PublicNavbar, AppFooter } from '@/components'
import { ContactForm as ContactPageContent } from '@/components'
import { useTranslation } from '@/i18n'

const Contact = () => {
  const { t, isKhmer } = useTranslation()

  return (
    <div className={clsx('min-h-screen bg-slate-50 flex flex-col', isKhmer && 'font-khmer')}>
      <PublicNavbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t('helpPage.back')}
        </Link>
        <ContactPageContent />
      </main>
      <AppFooter variant="full" />
    </div>
  )
}

export default Contact

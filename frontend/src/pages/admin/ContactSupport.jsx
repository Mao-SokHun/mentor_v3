import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { PageScaffold, PageCard } from '@/components'
import { useAuth } from '@/hooks'
import clsx from 'clsx'

const ContactSupport = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
    priority: 'normal',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <PageCard className="max-w-sm mx-auto text-center py-12">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h2>
        <p className="text-slate-500 text-sm mb-6">Our support team will get back to you once ticketing is connected.</p>
        <Button variant="primary" onClick={() => setSubmitted(false)}>Send Another Message</Button>
      </PageCard>
    )
  }

  return (
    <PageScaffold title="Contact Support" subtitle="Leave a message and our team will respond shortly">
      <div className="grid lg:grid-cols-3 gap-5">
        <PageCard className="lg:col-span-2">
          <h2 className="font-bold text-slate-800 mb-5">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Your Name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <Input label="Subject" placeholder="Briefly describe your issue" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority</label>
              <div className="flex gap-2">
                {['low', 'normal', 'high', 'critical'].map((p) => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                    className={clsx('flex-1 py-2 rounded-xl border text-xs font-semibold capitalize transition-all',
                      form.priority === p
                        ? p === 'critical' ? 'border-red-400 bg-red-50 text-red-600'
                        : p === 'high' ? 'border-amber-400 bg-amber-50 text-amber-600'
                        : p === 'normal' ? 'border-primary-300 bg-primary-50 text-primary-600'
                        : 'border-slate-400 bg-slate-50 text-slate-600'
                        : 'border-slate-200 text-slate-400 hover:bg-slate-50')}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
              <textarea
                rows={5}
                placeholder="Describe your issue in detail..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-primary-300 transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                <Send className="w-4 h-4" />Send Message
              </Button>
            </div>
          </form>
        </PageCard>

        <PageCard>
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-2">Support inbox</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ticket routing and support channels will be configured when the admin support API is connected.
          </p>
        </PageCard>
      </div>
    </PageScaffold>
  )
}

export default ContactSupport

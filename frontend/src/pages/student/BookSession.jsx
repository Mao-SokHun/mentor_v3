import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMentorDetail } from '@/hooks'
import { useTranslation } from '@/i18n'
import {
  ChevronLeft, ChevronRight, Calendar, Clock, CreditCard, CheckCircle,
  Star, Video, BookOpen, Zap, Shield
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { Stepper } from '@/components'
import { PageCard, PageScaffold } from '@/components'
import StandalonePageShell from '../../components/layout/StandalonePageShell'
import { bookSession } from '@/services/students/studentBookingService'
import { SHARED_ROUTES, STUDENT_ROUTES } from '@/constants/student/studentRoutes'
import clsx from 'clsx'

const DEFAULT_TOPICS = [
  { id: 'custom', label: 'Custom Topic', icon: '✏️', desc: 'Tell me what you need' },
]

const durations = [
  { id: 30, label: '30 min', sub: 'Quick session', multiplier: 0.5 },
  { id: 60, label: '60 min', sub: 'Standard', multiplier: 1, popular: true },
  { id: 90, label: '90 min', sub: 'Deep dive', multiplier: 1.5 },
  { id: 120, label: '2 hrs', sub: 'Intensive', multiplier: 2 },
]

const today = new Date()
const getDays = () => {
  return Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const steps = ['Topic', 'Schedule', 'Payment', 'Confirm']

const BookSession = () => {
  const { t } = useTranslation()
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const { mentor: row, availabilitySlots, loading, error } = useMentorDetail(mentorId)

  const topics = useMemo(() => {
    const subs = row?.subjects ?? []
    if (subs.length === 0) return DEFAULT_TOPICS
    const fromSkills = subs.map((label, i) => ({
      id: `skill-${i}`,
      label,
      icon: '📚',
      desc: `Session on ${label}`,
    }))
    return [...fromSkills, ...DEFAULT_TOPICS]
  }, [row?.subjects])

  const mentor = row
    ? {
        name: row.name,
        title: row.title ?? '',
        rating: row.rating ?? 0,
        reviews: row.reviews ?? 0,
        avatar: row.avatar ?? null,
        subjects: row.subjects ?? [],
        rate: row.rate ?? 0,
        currency: '$',
        location: row.location ?? 'Online',
      }
    : null

  const [step, setStep] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [notes, setNotes] = useState('')
  const [payMethod, setPayMethod] = useState('card')
  const [booked, setBooked] = useState(false)
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const formatDayLabel = (day) =>
    day
      ? `${dayNames[day.getDay()]}, ${monthNames[day.getMonth()]} ${day.getDate()}`
      : ''

  const timeSlotsForDay = useMemo(() => {
    if (!selectedDay) return []
    const dayLabel = formatDayLabel(selectedDay)
    const fromPosts = availabilitySlots
      .filter(
        (slot) =>
          !slot.date ||
          slot.date === dayLabel ||
          slot.label.includes(String(selectedDay.getDate()))
      )
      .map((slot) => slot.time || slot.label)
    const unique = [...new Set(fromPosts.filter(Boolean))]
    return unique.length > 0
      ? unique
      : availabilitySlots.map((s) => s.time || s.label).filter(Boolean)
  }, [selectedDay, availabilitySlots])

  if (loading) {
    return (
      <StandalonePageShell>
        <div className="py-16 text-center text-slate-500">{t('student.loadingMentors')}</div>
      </StandalonePageShell>
    )
  }

  if (error || !mentor) {
    return (
      <StandalonePageShell>
        <div className="py-16 text-center text-slate-600">{t('student.noMentors')}</div>
        <div className="text-center mt-4">
          <Link to="/schedule" className="text-sm text-primary-600 hover:underline">
            {t('student.browseSchedule')}
          </Link>
        </div>
      </StandalonePageShell>
    )
  }

  const days = getDays()
  const dur = durations.find(d => d.id === selectedDuration) || durations[1]
  const total = (mentor.rate * dur.multiplier).toFixed(2)

  const canNext = () => {
    if (step === 0) return selectedTopic !== null
    if (step === 1) return selectedDay !== null && selectedTime !== null
    if (step === 2) return true
    return false
  }

  const next = () => { if (canNext()) setStep(s => s + 1) }
  const prev = () => setStep(s => s - 1)

  const confirm = async () => {
    setBooking(true)
    setBookingError(null)
    try {
      const topicMeta = topics.find((item) => item.id === selectedTopic)
      const result = await bookSession({
        mentorId,
        mentorName: mentor.name,
        topic: selectedTopic,
        topicLabel: topicMeta?.label ?? '',
        sessionDate: formatDayLabel(selectedDay),
        sessionTime: selectedTime,
        durationMinutes: selectedDuration,
        totalPaid: Number(total),
        notes,
      })
      setConfirmedBooking(result)
      setBooked(true)
    } catch (err) {
      setBookingError(err?.message || t('student.bookingFailed'))
    } finally {
      setBooking(false)
    }
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-6">
        <PageCard className="max-w-md w-full text-center shadow-lg !p-10">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Session Booked!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your session with <strong>{mentor.name}</strong> is confirmed.<br />
            You'll receive a confirmation email shortly.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 text-left mb-6 space-y-2.5">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Topic</span><span className="font-medium text-slate-700">{topics.find(t => t.id === selectedTopic)?.label}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Date</span><span className="font-medium text-slate-700">{selectedDay ? `${dayNames[selectedDay.getDay()]}, ${monthNames[selectedDay.getMonth()]} ${selectedDay.getDate()}` : ''}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Time</span><span className="font-medium text-slate-700">{selectedTime}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Duration</span><span className="font-medium text-slate-700">{dur.label}</span></div>
            <div className="flex justify-between text-sm font-semibold"><span className="text-slate-600">Total Paid</span><span className="text-primary-600">${total}</span></div>
          </div>

          <div className="flex gap-3">
            <Link to={STUDENT_ROUTES.bookings} className="flex-1">
              <Button variant="primary" className="w-full">{t('student.viewMyBookings')}</Button>
            </Link>
            {confirmedBooking?.id ? (
              <Link to={STUDENT_ROUTES.sessionReview(confirmedBooking.id)} className="flex-1">
                <Button variant="ghost" className="w-full">{t('student.leaveReview')}</Button>
              </Link>
            ) : (
              <Link to={SHARED_ROUTES.home} className="flex-1">
                <Button variant="ghost" className="w-full">{t('student.backToHome')}</Button>
              </Link>
            )}
          </div>
        </PageCard>
      </div>
    )
  }

  return (
    <StandalonePageShell variant="ambient" className="min-h-screen">
      {/* Header */}
      <div className="glass-ios-nav sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to={`/mentor/${mentorId || '1'}`} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-slate-400">Booking session with</p>
            <p className="font-bold text-slate-800 text-sm">{mentor.name}</p>
          </div>
          <Stepper steps={steps} current={step} className="ml-auto" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 0 — Topic */}
            {step === 0 && (
              <PageCard>
                <h2 className="text-lg font-bold text-slate-800 mb-1">What would you like to study?</h2>
                <p className="text-slate-400 text-sm mb-5">Choose a topic for your session</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {topics.map((t) => (
                    <button key={t.id} onClick={() => setSelectedTopic(t.id)}
                      className={clsx('flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-soft',
                        selectedTopic === t.id ? 'border-primary-300 bg-primary-50' : 'border-slate-100 hover:border-slate-200')}>
                      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                        selectedTopic === t.id ? 'bg-primary-100' : 'bg-slate-100')}>
                        {t.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{t.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                      </div>
                      {selectedTopic === t.id && <CheckCircle className="w-4 h-4 text-primary-500 ml-auto flex-shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>

                {/* Duration */}
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm">Session Duration</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map((d) => (
                      <button key={d.id} onClick={() => setSelectedDuration(d.id)}
                        className={clsx('relative py-3 rounded-xl border-2 text-center transition-all',
                          selectedDuration === d.id ? 'border-primary-300 bg-primary-50' : 'border-slate-100 hover:border-slate-200')}>
                        {d.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-primary-400 text-white px-1.5 py-0.5 rounded-full font-bold">Popular</span>}
                        <p className="font-bold text-sm text-slate-800">{d.label}</p>
                        <p className="text-xs text-slate-400">{d.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTopic === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Describe what you need</label>
                    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. I need help understanding Fourier transforms for my exam next week..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none outline-none focus:border-primary-300 transition-colors" />
                  </div>
                )}
              </PageCard>
            )}

            {/* Step 1 — Schedule */}
            {step === 1 && (
              <PageCard>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Pick a date & time</h2>
                <p className="text-slate-400 text-sm mb-5">Select from available slots</p>

                {/* Date picker */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-500" />Choose a date</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {days.map((day, i) => {
                      const isSelected = selectedDay?.toDateString() === day.toDateString()
                      const isToday = day.toDateString() === today.toDateString()
                      return (
                        <button key={i} onClick={() => setSelectedDay(day)}
                          className={clsx('flex-shrink-0 w-14 py-3 rounded-2xl border-2 flex flex-col items-center transition-all',
                            isSelected ? 'border-primary-300 bg-primary-500 text-white' : 'border-slate-100 hover:border-primary-200 text-slate-700')}>
                          <span className={clsx('text-xs font-medium', isSelected ? 'text-primary-200' : 'text-slate-400')}>{dayNames[day.getDay()]}</span>
                          <span className="font-bold text-sm mt-0.5">{day.getDate()}</span>
                          {isToday && <span className={clsx('text-xs mt-0.5', isSelected ? 'text-primary-200' : 'text-primary-500 font-semibold')}>Today</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary-500" />Available times {selectedDay && `· ${dayNames[selectedDay.getDay()]}, ${monthNames[selectedDay.getMonth()]} ${selectedDay.getDate()}`}</h3>
                  {!selectedDay ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Select a date first to see available times</p>
                  ) : timeSlotsForDay.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">{t('mentorDetail.noAvailability')}</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlotsForDay.map((time) => (
                        <button key={time} onClick={() => setSelectedTime(time)}
                          className={clsx('py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                            selectedTime === time ? 'border-primary-300 bg-primary-500 text-white' :
                            'border-slate-100 hover:border-primary-200 text-slate-700')}>
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Additional notes for the teacher (optional)</label>
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any specific goals or materials to cover..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none outline-none focus:border-primary-300 transition-colors" />
                </div>
              </PageCard>
            )}

            {/* Step 2 — Payment */}
            {step === 2 && (
              <PageCard>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Payment</h2>
                <p className="text-slate-400 text-sm mb-5">Choose your payment method</p>

                <div className="flex gap-3 mb-5">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'paypal', label: 'PayPal', icon: Zap },
                    { id: 'wallet', label: 'RokKru Credits', icon: Shield },
                  ].map((m) => (
                    <button key={m.id} onClick={() => setPayMethod(m.id)}
                      className={clsx('flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all',
                        payMethod === m.id ? 'border-primary-300 bg-primary-50' : 'border-slate-100 hover:border-slate-200')}>
                      <m.icon className={clsx('w-5 h-5', payMethod === m.id ? 'text-primary-600' : 'text-slate-400')} />
                      <span className="text-xs font-medium text-slate-700">{m.label}</span>
                    </button>
                  ))}
                </div>

                {payMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Card Number</label>
                      <input placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300 font-mono tracking-wider" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Expiry</label>
                        <input placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">CVV</label>
                        <input placeholder="•••" type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Cardholder Name</label>
                      <input placeholder="Your full name" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300" />
                    </div>
                  </div>
                )}

                {payMethod === 'wallet' && (
                  <div className="bg-primary-50 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-primary-700 mb-1">RokKru Credits Balance</p>
                    <p className="text-3xl font-black text-primary-600 mb-3">$128.50</p>
                    <p className="text-xs text-primary-500">After this booking: <strong>${(128.50 - parseFloat(total)).toFixed(2)}</strong> remaining</p>
                  </div>
                )}

                {payMethod === 'paypal' && (
                  <div className="bg-blue-50 rounded-2xl p-5 text-center">
                    <p className="text-sm text-blue-700 font-medium">You'll be redirected to PayPal to complete payment after confirming.</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Payments are secured with 256-bit SSL encryption
                </div>
              </PageCard>
            )}

            {/* Step 3 — Confirm */}
            {step === 3 && (
              <PageCard>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Confirm your booking</h2>
                <p className="text-slate-400 text-sm mb-5">Review the details before confirming</p>

                <div className="space-y-3 mb-6">
                  {[
                    { label: t('auth.mentor'), value: mentor.name },
                    { label: 'Topic', value: topics.find(t => t.id === selectedTopic)?.label },
                    { label: 'Duration', value: dur.label },
                    { label: 'Date', value: selectedDay ? `${dayNames[selectedDay.getDay()]}, ${monthNames[selectedDay.getMonth()]} ${selectedDay.getDate()}, 2026` : '' },
                    { label: 'Time', value: selectedTime },
                    { label: 'Format', value: 'Online (Video Call)' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-400">{r.label}</span>
                      <span className="text-sm font-semibold text-slate-800">{r.value}</span>
                    </div>
                  ))}
                  {notes && (
                    <div className="py-2.5 border-b border-slate-50">
                      <p className="text-sm text-slate-400 mb-1">Notes</p>
                      <p className="text-sm text-slate-600">{notes}</p>
                    </div>
                  )}
                </div>

                <div className="bg-primary-50 rounded-2xl p-4 flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-primary-500 font-medium">Total due today</p>
                    <p className="text-2xl font-black text-primary-600">${total}</p>
                  </div>
                  <div className="text-right text-xs text-primary-500">
                    <p>${mentor.rate}/hr × {dur.multiplier}h</p>
                    <p className="font-semibold text-primary-500 mt-0.5">Free cancellation 24h before</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-400 mb-6">
                  <input type="checkbox" className="mt-0.5 rounded" defaultChecked />
                  <span>I agree to the <Link to="/terms" className="text-primary-500 underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-500 underline">Privacy Policy</Link>. The teacher will be notified and can confirm within 2 hours.</span>
                </div>

                {bookingError ? (
                  <p className="text-sm text-red-500 mb-3">{bookingError}</p>
                ) : null}
                <Button variant="primary" className="w-full" onClick={confirm} disabled={booking}>
                  <CheckCircle className="w-4 h-4" />Confirm & Pay ${total}
                </Button>
              </PageCard>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between">
              {step > 0 ? (
                <Button variant="ghost" onClick={prev}><ChevronLeft className="w-4 h-4" />Back</Button>
              ) : (
                <Link to={`/mentor/${mentorId || '1'}`}>
                  <Button variant="ghost"><ChevronLeft className="w-4 h-4" />Teacher Profile</Button>
                </Link>
              )}
              {step < steps.length - 1 && (
                <Button variant="primary" onClick={next} disabled={!canNext()}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar — teacher + booking summary */}
          <div className="space-y-4">
            {/* Teacher card */}
            <PageCard>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={mentor.name} size="md" online />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{mentor.name}</p>
                  <p className="text-xs text-slate-400">{mentor.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="font-semibold">{mentor.rating}</span><span>({mentor.reviews})</span></div>
                <div className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-primary-500" />Online</div>
              </div>
              <div className="flex flex-wrap gap-1">
                {mentor.subjects.map(s => <Badge key={s} variant="primary" size="sm">{s}</Badge>)}
              </div>
            </PageCard>

            {/* Booking summary */}
            <PageCard>
              <h3 className="font-bold text-slate-800 text-sm mb-4">Booking Summary</h3>
              <div className="space-y-2.5">
                {selectedTopic && (
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Topic</span><span className="font-medium text-slate-700">{topics.find(t => t.id === selectedTopic)?.label}</span></div>
                )}
                <div className="flex justify-between text-sm"><span className="text-slate-400">Duration</span><span className="font-medium text-slate-700">{dur.label}</span></div>
                {selectedDay && (
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Date</span><span className="font-medium text-slate-700">{monthNames[selectedDay.getMonth()]} {selectedDay.getDate()}</span></div>
                )}
                {selectedTime && (
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Time</span><span className="font-medium text-slate-700">{selectedTime}</span></div>
                )}
                <div className="border-t border-slate-100 pt-2.5 flex justify-between font-semibold">
                  <span className="text-slate-700">Total</span>
                  <span className="text-primary-600 text-base">${total}</span>
                </div>
              </div>
            </PageCard>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-700 space-y-1.5">
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" />Free cancellation up to 24h before</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" />Money-back if teacher doesn't show</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" />Session recording available</div>
            </div>
          </div>
        </div>
      </div>
    </StandalonePageShell>
  )
}

export default BookSession

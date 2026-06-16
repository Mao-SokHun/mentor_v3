import { useState } from 'react'
import { CheckCircle, MapPin, Users, Clock, Globe, BookOpen, Star, MessageCircle, Share2, Heart, Award, ArrowLeft, Video, Calendar } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import StarRating from '../../components/ui/StarRating'
import { useMentorDetail } from '@/hooks'
import { useTranslation } from '@/i18n'
import clsx from 'clsx'

const MentorPublicProfile = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { mentor, credentials, availabilitySlots, loading, error } = useMentorDetail(id)
  const reviews = []
  const timeSlots = availabilitySlots.map((slot) => slot.label)
  const [selectedSlot, setSelectedSlot] = useState(0)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('About')

  const tabs = ['About', 'Reviews', 'Availability']

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">{t('student.loadingMentors')}</div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="py-12 text-center text-slate-600">{t('student.noMentors')}</div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/home" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Search
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left / Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile hero */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-sky-400 via-primary-400 to-primary-400 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
                <div className="ring-4 ring-white rounded-2xl shadow-lg">
                  <Avatar name={mentor.name} size="xl" online={mentor.online} />
                </div>
                <div className="flex gap-2 pb-1">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={clsx('p-2.5 rounded-xl border transition-all', liked ? 'bg-primary-50 border-primary-200 text-primary-500' : 'bg-slate-100 border-transparent hover:bg-slate-200 text-slate-500')}
                  >
                    <Heart className={clsx('w-4 h-4', liked && 'fill-primary-500')} />
                  </button>
                  <button className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800">{mentor.name}</h1>
                {mentor.verified && (
                  <div className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </div>
                )}
              </div>
              {(mentor.subject || mentor.major) && (
                <p className="text-slate-500 mt-0.5 text-sm">
                  {[mentor.subject, mentor.major].filter(Boolean).join(' · ')}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-800">{mentor.rating}</span>
                  <span>({mentor.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary-500" />
                  {mentor.students.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  {mentor.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  {mentor.experience} years exp.
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {mentor.subjects.map((s) => (
                  <Badge key={s} variant="primary">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-slate-100 px-6">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      'px-5 py-3.5 text-sm font-medium border-b-2 transition-all',
                      activeTab === tab
                        ? 'border-primary-400 text-primary-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab: About */}
          {activeTab === 'About' && (
            <>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
                <h2 className="font-bold text-slate-800 mb-3">About Me</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{mentor.bio}</p>
                <p className="text-sm text-slate-600 leading-relaxed mt-3">
                  My teaching philosophy centers on building genuine understanding rather than rote
                  memorization. I tailor each session to the student's unique learning style and goals,
                  using real-world projects to make abstract concepts stick.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
                <h2 className="font-bold text-slate-800 mb-4">Skills & Expertise</h2>
                {mentor.major || mentor.subject || mentor.subjects?.length > 0 ? (
                  <div className="space-y-3">
                    {mentor.major ? (
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">{t('filters.major')}:</span>{' '}
                        {mentor.major}
                      </p>
                    ) : null}
                    {mentor.subject ? (
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">{t('filters.subject')}:</span>{' '}
                        {mentor.subject}
                      </p>
                    ) : null}
                    {mentor.subjects?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {mentor.subjects.map((skill) => (
                          <Badge key={skill} variant="primary">{skill}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">{t('mentorDetail.noCredentials')}</p>
                )}
              </div>

              {credentials.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
                  <h2 className="font-bold text-slate-800 mb-4">Portfolio</h2>
                  <div className="space-y-3">
                    {credentials.map((c, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">{c.text}</span>
                        {c.href && (
                          <a
                            href={c.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline text-xs"
                          >
                            {t('mentorDetail.viewLink')}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
                <h2 className="font-bold text-slate-800 mb-4">Quick Info</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Globe, label: 'Languages', value: 'Khmer, English' },
                    { icon: Award, label: 'Credentials', value: 'PhD, Data Science' },
                    { icon: BookOpen, label: 'Experience', value: `${mentor.experience} years` },
                    { icon: Video, label: 'Session type', value: 'Online (Zoom / Meet)' },
                    { icon: Clock, label: 'Response time', value: 'Usually within 1 hour' },
                    { icon: Calendar, label: 'Availability', value: 'Mon, Wed, Fri, Sat' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <item.icon className="w-4 h-4 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{item.label}</p>
                        <p className="text-sm font-medium text-slate-700">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab: Reviews */}
          {activeTab === 'Reviews' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800">Student Reviews</h2>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-slate-800">{mentor.rating}</span>
                  <div>
                    <StarRating rating={mentor.rating} size="md" />
                    <p className="text-xs text-slate-400 mt-0.5">{mentor.reviewCount} reviews</p>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                {reviews.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">{t('mentorDetail.noReviews')}</p>
                )}
                {reviews.map((r, i) => (
                  <div key={i} className="pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={r.author} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{r.author}</p>
                        <p className="text-xs text-slate-400">{r.time}</p>
                      </div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Availability */}
          {activeTab === 'Availability' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
              <h2 className="font-bold text-slate-800 mb-4">Available This Week</h2>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                  <div key={d} className={clsx('text-center p-3 rounded-xl', [0,2,4,5].includes(i) ? 'bg-primary-50 border border-primary-200' : 'bg-slate-50 border border-slate-100')}>
                    <p className="text-xs font-medium text-slate-500">{d}</p>
                    <p className={clsx('text-sm font-bold mt-1', [0,2,4,5].includes(i) ? 'text-primary-700' : 'text-slate-300')}>
                      {[0,2,4,5].includes(i) ? '✓' : '—'}
                    </p>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Published sessions</h3>
              {timeSlots.length === 0 ? (
                <p className="text-sm text-slate-500">{t('mentorDetail.noAvailability')}</p>
              ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot, i) => (
                  <button key={slot} onClick={() => setSelectedSlot(i)}
                    className={clsx('py-2.5 px-3 rounded-xl text-sm font-medium border transition-all',
                      selectedSlot === i ? 'bg-primary-500 text-white border-primary-400' : 'border-slate-200 text-slate-600 hover:border-primary-200')}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-black text-primary-600">${mentor.price}</p>
                <p className="text-xs text-slate-400">per hour</p>
              </div>
              {mentor.online && (
                <Badge variant="success" dot>Available now</Badge>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-slate-700">Quick select time:</p>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot, i) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(i)}
                    className={clsx(
                      'text-xs py-2 px-3 rounded-xl border font-medium transition-all',
                      selectedSlot === i
                        ? 'bg-primary-500 text-white border-primary-400'
                        : 'border-slate-200 text-slate-600 hover:border-primary-200'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>1 hour session</span>
                <span className="font-medium">${mentor.price}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform fee</span>
                <span className="font-medium">$2</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2">
                <span>Total</span>
                <span>${(mentor.price || 0) + 2}</span>
              </div>
            </div>

            <Button variant="secondary" size="lg" className="w-full mb-2">
              <Calendar className="w-4 h-4" />
              Book Session
            </Button>
            <Button variant="ghost" size="md" className="w-full">
              <MessageCircle className="w-4 h-4" />
              Send Message
            </Button>

            <p className="text-xs text-center text-slate-400 mt-3">Free cancellation up to 24h before</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorPublicProfile

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, User, BookOpen, Target } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { PageCard, RokkruLogo } from '@/components'
import clsx from 'clsx'

const steps = [
  { id: 1, label: 'Basic Info', icon: User },
  { id: 2, label: 'Interests', icon: BookOpen },
  { id: 3, label: 'Goals', icon: Target },
]

const subjects = ['Mathematics', 'Physics', 'Data Science', 'English', 'Programming', 'Chemistry', 'Biology', 'History', 'Economics', 'Art']
const goals = [
  'Improve exam scores',
  'Learn a new skill',
  'Prepare for a career change',
  'Personal enrichment',
  'Homework help',
  'University preparation',
]

const CompleteProfile = () => {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState([])
  const [selectedGoals, setSelectedGoals] = useState([])
  const navigate = useNavigate()

  const toggleSubject = (s) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const toggleGoal = (g) =>
    setSelectedGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1)
    else navigate('/onboarding/choose-community')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <RokkruLogo to="/" size="md" />
        </div>

        <PageCard padding={false} className="shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-0">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                        step > s.id
                          ? 'bg-emerald-500 text-white'
                          : step === s.id
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-medium text-slate-500">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={clsx(
                        'flex-1 h-0.5 mx-2 rounded-full',
                        step > s.id ? 'bg-emerald-400' : 'bg-slate-100'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Complete Your Profile</h2>
                  <p className="text-slate-500 text-sm mt-1">Tell us a bit about yourself to get started</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" placeholder="Alex" />
                  <Input label="Last Name" placeholder="Johnson" />
                </div>
                <Input label="Address / Location" placeholder="Phnom Penh, Cambodia" />
                <Input label="Phone Number" type="tel" placeholder="+855 12 000 000" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Professional Bio (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tell teachers about your learning background and goals..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">What do you want to learn?</h2>
                  <p className="text-slate-500 text-sm mt-1">Select all subjects that interest you</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={clsx(
                        'flex items-center gap-2 p-3 rounded-xl border text-sm font-medium text-left transition-all',
                        selected.includes(s)
                          ? 'bg-primary-500 text-white border-primary-400'
                          : 'border-slate-200 text-slate-600 hover:border-primary-200 hover:bg-primary-50'
                      )}
                    >
                      {selected.includes(s) && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      {s}
                    </button>
                  ))}
                </div>
                {selected.length > 0 && (
                  <p className="text-xs text-primary-600 text-center font-medium">
                    {selected.length} subject{selected.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">What are your learning goals?</h2>
                  <p className="text-slate-500 text-sm mt-1">This helps us recommend the right teachers</p>
                </div>
                <div className="space-y-2">
                  {goals.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGoal(g)}
                      className={clsx(
                        'w-full flex items-center gap-3 p-4 rounded-xl border text-sm font-medium text-left transition-all',
                        selectedGoals.includes(g)
                          ? 'bg-primary-500 text-white border-primary-400'
                          : 'border-slate-200 text-slate-600 hover:border-primary-200 hover:bg-primary-50'
                      )}
                    >
                      <div
                        className={clsx(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          selectedGoals.includes(g) ? 'border-white bg-white' : 'border-slate-300'
                        )}
                      >
                        {selectedGoals.includes(g) && <Check className="w-3 h-3 text-primary-600" />}
                      </div>
                      {g}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button variant="ghost" size="md" type="button" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              {step < 3 && (
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Skip for now
                </button>
              )}
              <Button
                variant="primary"
                size="md"
                type="button"
                onClick={handleNext}
                disabled={step === 2 && selected.length === 0}
              >
                {step === 3 ? 'Get Started' : 'Continue'}
              </Button>
            </div>
          </div>
        </PageCard>

        <p className="text-center text-xs text-slate-400 mt-4">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default CompleteProfile

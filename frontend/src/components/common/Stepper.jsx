import { CheckCircle, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

/**
 * Stepper / Wizard Steps
 * Horizontal step indicator used in multi-step flows.
 *
 * Props:
 *   steps      string[]  — step labels
 *   current    number    — 0-based index of current step
 *   className  string
 */
const Stepper = ({ steps = [], current = 0, className }) => (
  <div className={clsx('flex items-center gap-1 flex-wrap', className)}>
    {steps.map((step, i) => (
      <div key={step} className="flex items-center gap-1">
        <div className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          i < current
            ? 'bg-emerald-100 text-emerald-700'
            : i === current
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 text-slate-400'
        )}>
          {i < current
            ? <CheckCircle className="w-3 h-3" />
            : <span>{i + 1}</span>}
          <span className="hidden sm:inline">{step}</span>
        </div>
        {i < steps.length - 1 && (
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        )}
      </div>
    ))}
  </div>
)

export default Stepper

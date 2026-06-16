import clsx from 'clsx'
import { polygonPresets } from '@/constants'

const GRADIENTS = {
  rose: ['#f3d9dd', '#c07888', '#8f5562'],
  roseLight: ['#faeef0', '#e8bcc3', '#d495a1'],
  white: ['#ffffff', '#faeef0', '#ffffff'],
  ink: ['#e8bcc3', '#a86674', '#5f3a42'],
  slate: ['#e2e8f0', '#94a3b8', '#64748b'],
  slateLight: ['#f8fafc', '#cbd5e1', '#94a3b8'],
  cyan: ['#cffafe', '#22d3ee', '#0891b2'],
  cyanLight: ['#ecfeff', '#a5f3fc', '#67e8f9'],
}

const renderElement = (el, idx, variant) => {
  const props = { key: idx, points: el.points }

  if (el.fill === 'none') props.fill = 'none'
  else if (el.fillGradient) {
    props.fill = `url(#poly-grad-${el.fillGradient}-${variant})`
  } else if (el.fill) props.fill = 'currentColor'

  if (el.fillOpacity != null) props.fillOpacity = el.fillOpacity

  if (el.stroke) {
    props.stroke = el.strokeGradient
      ? `url(#poly-grad-${el.strokeGradient}-${variant})`
      : 'currentColor'
    props.strokeWidth = el.strokeWidth ?? 1.5
    if (el.strokeOpacity != null) props.strokeOpacity = el.strokeOpacity
    if (el.strokeDasharray) props.strokeDasharray = el.strokeDasharray
    props.strokeLinejoin = 'round'
    props.strokeLinecap = 'round'
  }

  return <polygon {...props} />
}

const GradientDefs = ({ variant }) => (
  <defs>
    {Object.entries(GRADIENTS).map(([name, stops]) => (
      <linearGradient
        key={name}
        id={`poly-grad-${name}-${variant}`}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor={stops[0]} stopOpacity={name === 'white' ? 0.95 : 0.85} />
        <stop offset="55%" stopColor={stops[1]} stopOpacity={0.75} />
        <stop offset="100%" stopColor={stops[2]} stopOpacity={0.55} />
      </linearGradient>
    ))}
  </defs>
)

const hasGradients = (shapes) =>
  shapes.some((s) => s.elements.some((e) => e.fillGradient || e.strokeGradient))

/**
 * Animated polygon layer — layered Rok Kru geometry (gradients + glow).
 * @param {keyof typeof polygonPresets} variant
 */
const PolygonBackground = ({ variant = 'auth', className }) => {
  const shapes = polygonPresets[variant] ?? polygonPresets.auth
  const defs = hasGradients(shapes)

  return (
    <div
      className={clsx(
        'absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0',
        className
      )}
      aria-hidden
    >
      {shapes.map((shape, i) => {
        const svg = (
          <svg viewBox={shape.viewBox} className={clsx('w-full h-full', shape.color)}>
            {defs && <GradientDefs variant={variant} />}
            {shape.elements.map((el, j) => renderElement(el, j, variant))}
          </svg>
        )

        const adminGlow = String(variant).includes('admin-panel')
        const animCls = clsx(
          shape.anim,
          shape.glow && (adminGlow ? 'poly-shape-glow--admin' : 'poly-shape-glow'),
          shape.blend && `poly-blend-${shape.blend}`
        )

        if (shape.inner) {
          return (
            <div key={i} className={shape.wrapper}>
              <div className={clsx(animCls, 'w-full h-full')}>{svg}</div>
            </div>
          )
        }

        return (
          <div key={i} className={clsx(shape.wrapper, animCls)}>
            {svg}
          </div>
        )
      })}
    </div>
  )
}

export default PolygonBackground

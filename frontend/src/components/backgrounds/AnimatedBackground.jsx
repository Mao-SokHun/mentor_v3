import clsx from 'clsx'
import PolygonBackground from './PolygonBackground'
import MeshNetworkBackground from './MeshNetworkBackground'
import AmbientColorWash from './AmbientColorWash'

const SOFT_PRESETS = {
  'admin-panel': 'admin-panel-soft',
  features: 'features',
  cta: 'cta',
  landing: 'landing',
}

const DARK_MESH_VARIANTS = new Set(['auth', 'admin', 'landing'])

/**
 * Animated background — admin auth + public marketing only.
 * @param {'polygons'|'mesh'|'both'} style
 */
const AnimatedBackground = ({
  variant = 'ambient',
  intensity = 'soft',
  breathe = false,
  className,
  style = 'both',
}) => {
  const resolved =
    intensity === 'soft'
      ? SOFT_PRESETS[variant] ?? `${variant}-soft`
      : variant

  const meshPreset = DARK_MESH_VARIANTS.has(variant) ? 'dark' : 'light'
  const showMesh = style === 'mesh' || style === 'both'
  const showPolygons = style === 'polygons' || style === 'both'
  const isLightPage = meshPreset === 'light' && intensity === 'soft'

  return (
    <div
      className={clsx(
        'pointer-events-none overflow-hidden absolute inset-0 w-full h-full min-h-[200px]',
        breathe && 'poly-bg-breathe-wrap',
        className
      )}
    >
      {isLightPage && <AmbientColorWash />}
      {showMesh && <MeshNetworkBackground preset={meshPreset} />}
      {showPolygons && (
        <div className="absolute inset-0 w-full h-full">
          <PolygonBackground variant={resolved} />
        </div>
      )}
    </div>
  )
}

export default AnimatedBackground

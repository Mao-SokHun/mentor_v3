import clsx from 'clsx'
import { meshPresets } from '@/constants'

/**
 * Plexus-style connected dots + lines (subtle, brand colors).
 * @param {'dark'|'light'} preset
 */
const MeshNetworkBackground = ({ preset = 'dark', className }) => {
  const cfg = meshPresets[preset] ?? meshPresets.dark

  return (
    <div
      className={clsx(
        'absolute inset-0 pointer-events-none overflow-hidden',
        cfg.anim,
        className
      )}
      style={{ opacity: cfg.layerOpacity ?? 1 }}
      aria-hidden
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {cfg.edges.map(([a, b], i) => (
          <line
            key={`e-${i}`}
            x1={cfg.nodes[a][0]}
            y1={cfg.nodes[a][1]}
            x2={cfg.nodes[b][0]}
            y2={cfg.nodes[b][1]}
            stroke={cfg.lineColor}
            strokeWidth={preset === 'light' || preset === 'admin' ? '0.5' : '0.32'}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {cfg.nodes.map(([x, y], i) => (
          <circle
            key={`n-${i}`}
            cx={x}
            cy={y}
            r={cfg.dotRadius}
            fill={cfg.nodeColor}
          />
        ))}
      </svg>
    </div>
  )
}

export default MeshNetworkBackground

/**
 * Animated backgrounds — import from `@/components/backgrounds`.
 *
 * Usage:
 *   <AnimatedBackground variant="landing" intensity="normal" style="both" />
 *   <AuthHeroBackground variant="auth" />  // login hero panel
 */

export { default as AnimatedBackground } from './AnimatedBackground'
export { default as AuthHeroBackground } from './AuthHeroBackground'

// Layers (advanced / custom compositions)
export { default as AmbientColorWash } from './AmbientColorWash'
export { default as MeshNetworkBackground } from './MeshNetworkBackground'
export { default as PolygonBackground } from './PolygonBackground'

// Presets (shape data — edit to tune animations)
export { polygonPresets } from '@/constants'
export { meshPresets } from '@/constants'

/** @deprecated Use AuthHeroBackground */
export { default as AuthHeroShapes } from './AuthHeroBackground'

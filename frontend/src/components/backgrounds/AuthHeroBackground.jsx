import AnimatedBackground from './AnimatedBackground'

/** Login hero panel — mesh + polygon animation (student, teacher, admin). */
const AuthHeroBackground = ({ variant = 'auth', meshStyle = 'both' }) => (
  <AnimatedBackground variant={variant} intensity="normal" style={meshStyle} className="z-0" />
)

export default AuthHeroBackground

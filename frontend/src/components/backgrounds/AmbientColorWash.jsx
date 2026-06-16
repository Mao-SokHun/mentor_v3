/**
 * Soft rose/sky color blobs — visible through glass like light on a mirror.
 */
const AmbientColorWash = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    <div className="ambient-wash-base absolute inset-0" />
    <div className="ambient-blob ambient-blob--rose" />
    <div className="ambient-blob ambient-blob--blush" />
    <div className="ambient-blob ambient-blob--sky" />
  </div>
)

export default AmbientColorWash

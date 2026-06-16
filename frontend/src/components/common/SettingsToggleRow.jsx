import Toggle from '../ui/Toggle'

/**
 * SettingsToggleRow
 * A labeled settings row with a toggle switch on the right.
 * Used in Notification, Privacy, Feature Flags settings sections.
 *
 * Props:
 *   label      string
 *   description string   — optional sub-text
 *   checked    boolean
 *   onChange   (bool) => void
 *   disabled   boolean
 */
const SettingsToggleRow = ({ label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
    <div className="flex-1 min-w-0 pr-4">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
    <Toggle checked={checked} onChange={onChange} disabled={disabled} />
  </div>
)

export default SettingsToggleRow

/** Helper copy under auth forms (required hint, password rules, terms) */
export const FORM_FINE_PRINT_CLASS =
  'text-xs sm:text-sm text-slate-600 leading-relaxed'

/** Small note above forms: fields marked * are required */
const RequiredFieldsHint = ({ children, className = '' }) => (
  <p className={`${FORM_FINE_PRINT_CLASS} ${className}`.trim()}>{children}</p>
)

export default RequiredFieldsHint

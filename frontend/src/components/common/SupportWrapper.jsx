const SupportWrapper = ({ children, title }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {title && <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>}
      {children}
    </div>
  )
}
export default SupportWrapper

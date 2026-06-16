const MentorProfileSectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-600" strokeWidth={2} />
      </span>
      <h2 className="text-sm font-semibold text-slate-800 truncate leading-snug">
        {title}
      </h2>
    </div>
    {action}
  </div>
)

export default MentorProfileSectionHeader

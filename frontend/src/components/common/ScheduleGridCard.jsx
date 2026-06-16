const ScheduleGridCard = ({ session }) => {
  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="text-sm font-medium text-slate-700">{session?.subject || 'Session'}</p>
      <p className="text-xs text-slate-500">{session?.date} {session?.startTime}</p>
    </div>
  )
}
export default ScheduleGridCard

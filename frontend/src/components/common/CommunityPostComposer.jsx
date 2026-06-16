import { Image, Video, Smile } from 'lucide-react'
import Avatar from '../ui/Avatar'

const CommunityPostComposer = ({
  userName = 'User',
  value,
  onChange,
  onPost,
  maxLength = 500,
  compact = false,
}) => (
  <div className={compact ? 'glass-panel rounded-xl px-5 sm:px-6 py-2.5 sm:py-3' : 'glass-panel p-6 sm:p-7'}>
    <div className={compact ? 'flex items-start gap-3' : 'flex items-start gap-4 sm:gap-5'}>
      <Avatar
        name={userName}
        size={compact ? 'xs' : 'sm'}
        className="mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <textarea
          rows={compact ? 1 : 2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What's on your mind?"
          className={compact
            ? 'w-full text-sm text-slate-700 bg-transparent outline-none resize-none placeholder-slate-400 min-h-[2.25rem] py-0.5'
            : 'w-full text-sm text-slate-700 bg-transparent outline-none resize-none placeholder-slate-400'}
        />
        <div
          className={compact
            ? 'flex flex-wrap items-center justify-between gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100'
            : 'flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100'}
        >
          <div className="flex items-center gap-0.5">
            {[
              { Icon: Video, label: 'Live Video' },
              { Icon: Image, label: 'Photo' },
              { Icon: Smile, label: 'Feeling' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                className={compact
                  ? 'flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors'
                  : 'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors'}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-300">{value.length}/{maxLength}</span>
            <button
              type="button"
              disabled={!value.trim()}
              onClick={onPost}
              className={compact
                ? 'px-3 py-1 bg-primary-500 text-white text-[11px] font-bold rounded-md hover:bg-primary-600 disabled:opacity-40 transition-colors'
                : 'px-4 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 disabled:opacity-40 transition-colors'}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default CommunityPostComposer

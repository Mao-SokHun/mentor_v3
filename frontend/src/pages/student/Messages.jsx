import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Send, MoreHorizontal, Phone, Video, Smile, Paperclip, ArrowLeft,
  CheckCheck, Plus, Star, MessageSquare,
} from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { PageCard, PageAmbient } from '@/components'
import clsx from 'clsx'
import { STUDENT_ROUTES } from '@/constants/student/studentRoutes'

/** When wired to API: each row needs `mentorId` for book links */
const conversations = []

const quickReplies = ['Sounds good! 👍', 'Thanks!', 'Can we reschedule?', 'See you then!']

const Messages = () => {
  const [selected, setSelected] = useState(null)
  const [newMsg, setNewMsg] = useState('')
  const [msgs, setMsgs] = useState([])
  const [search, setSearch] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const selectConv = (conv) => {
    setSelected(conv)
    setMsgs(conv.messages)
    setShowSidebar(false)
  }

  const send = (text) => {
    const msg = text || newMsg.trim()
    if (!msg) return
    setMsgs((prev) => [...prev, { id: Date.now(), from: 'me', text: msg, time: 'Now' }])
    setNewMsg('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0)

  return (
    <PageAmbient variant="ambient" className="flex h-[calc(100vh-4rem)] overflow-hidden -m-5 sm:-m-6 gap-0">
      <PageCard
        padding={false}
        className={clsx(
          'flex-shrink-0 w-80 flex flex-col rounded-none sm:rounded-xl border-r sm:border border-slate-100 h-full',
          !showSidebar && 'hidden lg:flex'
        )}
      >
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-lg">
              Messages
              {totalUnread > 0 && (
                <span className="ml-1 text-xs bg-primary-400 text-white px-1.5 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8 px-4">No conversations yet.</p>
          )}
          {filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => selectConv(conv)}
              className={clsx(
                'w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left',
                selected?.id === conv.id && 'bg-primary-50/50'
              )}
            >
              <div className="flex-shrink-0 relative">
                <Avatar name={conv.name} size="md" />
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-sm text-slate-800 truncate">{conv.name}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate flex-1">{conv.lastMsg}</p>
                  {conv.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <Badge variant={conv.role === 'mentor' ? 'info' : 'neutral'} size="sm" className="mt-1">
                  {conv.role}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </PageCard>

      {selected ? (
        <PageCard padding={false} className="flex-1 flex flex-col min-w-0 rounded-none sm:rounded-xl h-full overflow-hidden">
          <div className="h-16 border-b border-slate-100 flex items-center justify-between px-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="relative flex-shrink-0">
                <Avatar name={selected.name} size="sm" />
                {selected.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{selected.name}</p>
                <p className="text-xs text-slate-400">{selected.online ? '● Online' : 'Last seen recently'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {selected.role === 'mentor' && selected.mentorId && (
                <Link to={STUDENT_ROUTES.book(selected.mentorId)}>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 mr-2"
                  >
                    Book Session
                  </button>
                </Link>
              )}
              <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <Phone className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <Video className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <Star className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
            <div className="text-center text-xs text-slate-400 py-2">Today</div>
            {msgs.map((msg) => (
              <div key={msg.id} className={clsx('flex', msg.from === 'me' ? 'justify-end' : 'justify-start')}>
                {msg.from !== 'me' && <Avatar name={selected.name} size="xs" className="mr-2 mt-auto flex-shrink-0" />}
                <div className={clsx('max-w-xs lg:max-w-md flex flex-col gap-0.5', msg.from === 'me' ? 'items-end' : 'items-start')}>
                  <div
                    className={clsx(
                      'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      msg.from === 'me'
                        ? 'bg-primary-500 text-white rounded-br-sm'
                        : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
                    )}
                  >
                    {msg.text}
                  </div>
                  <div className={clsx('flex items-center gap-1', msg.from === 'me' && 'flex-row-reverse')}>
                    <span className="text-xs text-slate-400">{msg.time}</span>
                    {msg.from === 'me' && <CheckCheck className="w-3 h-3 text-primary-500" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="px-5 pb-2 flex gap-2 overflow-x-auto border-t border-slate-50 pt-2">
            {quickReplies.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => send(r)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-full text-slate-600 hover:border-primary-200 hover:text-primary-600"
              >
                {r}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 flex items-end gap-3 bg-white">
            <button type="button" className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 flex items-end gap-2">
              <textarea
                rows={1}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none resize-none max-h-24"
                style={{ minHeight: '24px' }}
              />
              <button type="button" className="flex-shrink-0 text-slate-400 hover:text-slate-600">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => send()}
              disabled={!newMsg.trim()}
              className={clsx(
                'p-2.5 rounded-xl transition-all flex-shrink-0',
                newMsg.trim() ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </PageCard>
      ) : (
        <PageCard className="flex-1 flex items-center justify-center text-slate-400 rounded-none sm:rounded-xl">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Select a conversation</p>
            <p className="text-sm text-slate-400 mt-1">Choose from your conversations on the left</p>
          </div>
        </PageCard>
      )}
    </PageAmbient>
  )
}

export default Messages

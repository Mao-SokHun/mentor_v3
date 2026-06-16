import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import MentorQuickViewModal from '@/components/common/MentorQuickViewModal'

const MentorQuickViewContext = createContext(null)

export function MentorQuickViewProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    mentor: null,
    sessionMeta: null,
  })

  const openQuickView = useCallback((mentor, sessionMeta = null) => {
    if (!mentor) return
    const id = mentor.id ?? mentor.userId
    if (!id) return
    setState({
      open: true,
      mentor: { ...mentor, id: String(id) },
      sessionMeta,
    })
  }, [])

  const closeQuickView = useCallback(() => {
    setState({ open: false, mentor: null, sessionMeta: null })
  }, [])

  const value = useMemo(
    () => ({ openQuickView, closeQuickView, isOpen: state.open }),
    [openQuickView, closeQuickView, state.open]
  )

  return (
    <MentorQuickViewContext.Provider value={value}>
      {children}
      <MentorQuickViewModal
        open={state.open}
        mentor={state.mentor}
        sessionMeta={state.sessionMeta}
        onClose={closeQuickView}
      />
    </MentorQuickViewContext.Provider>
  )
}

export function useMentorQuickView() {
  return useContext(MentorQuickViewContext)
}

export default MentorQuickViewContext

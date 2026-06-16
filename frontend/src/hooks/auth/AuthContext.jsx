import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { clearAuthSession, getStoredUser, getToken, COOKIE_SESSION_TOKEN, setAuthSession } from '@/lib/authStorage'
import { applyProfileCache, saveProfileCache } from '@/lib/profileCache'
import { isApiEnabled } from '@/constants'
import { registerUnauthorizedHandler } from '@/services'
import * as authService from '@/services'

export { getStoredUser } from '@/lib/authStorage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = getStoredUser()
    return stored ? applyProfileCache(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearAuthSession()
      setUser(null)
    })

    let cancelled = false

    const bootstrap = async () => {
      try {
        if (isApiEnabled()) {
          try {
            const me = await authService.fetchCurrentUser()
            if (!cancelled && me) {
              setAuthSession({ user: me })
              setUser(me)
            }
          } catch {
            const stored = getStoredUser()
            if (!cancelled && stored && getToken()) {
              setUser(applyProfileCache(stored))
            } else if (!cancelled) {
              clearAuthSession()
              setUser(null)
            }
          }
          return
        }

        if (!getToken()) {
          setUser(null)
          return
        }
        const me = await authService.fetchCurrentUser()
        if (!cancelled && me) setUser(me)
      } catch {
        if (!cancelled) {
          clearAuthSession()
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const loggedIn = await authService.login(credentials)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const verifyLoginOtp = useCallback(async (data) => {
    const loggedIn = await authService.verifyLoginOtp(data)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const register = useCallback(async (data) => {
    const registered = await authService.register(data)
    setUser(registered)
    return registered
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), ...patch }
      setAuthSession({ user: next })
      if (next?.id) saveProfileCache(next.id, next)
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyLoginOtp, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { AUTH_UNAUTHORIZED_EVENT, getStoredToken, setStoredToken } from "@/lib/api/client";
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, type AuthUser } from "@/services/auth.service"

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  isSubmitting: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(() => Boolean(getStoredToken()))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearSession = useCallback(() => {
    setStoredToken(null)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    let cancelled = false
    const token = getStoredToken()
    if (!token) {
      setIsBootstrapping(false)
      return
    }
    fetchCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {
        if (!cancelled) clearSession()
      })
      .finally(() => {
        if (!cancelled) setIsBootstrapping(false)
      })
    return () => {
      cancelled = true
    }
  }, [clearSession])

  useEffect(() => {
    function onUnauthorized() {
      clearSession()
      navigate("/login", { replace: true })
    }
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
  }, [clearSession, navigate])

  const login = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true)
    try {
      const { token, user: nextUser } = await loginRequest(email, password)
      setStoredToken(token)
      setUser(nextUser)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession()
      navigate("/login", { replace: true })
    }
  }, [clearSession, navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      isSubmitting,
      login,
      logout,
    }),
    [user, isBootstrapping, isSubmitting, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

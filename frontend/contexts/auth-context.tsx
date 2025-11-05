"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, getAuthState, login as authLogin, register as authRegister, logout as authLogout } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load auth state on mount
    const state = getAuthState()
    setUser(state.user)
    setIsAuthenticated(state.isAuthenticated)
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const result = authLogin(email, password)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const result = authRegister(email, password, firstName, lastName)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const logout = () => {
    authLogout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

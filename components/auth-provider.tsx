"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, authApi } from "@/lib/api-service"

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "CUSTOMER" | "OWNER") => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

// Create a default context value to avoid null reference errors
const defaultContextValue: AuthContextType = {
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isLoading: true,
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Auth check failed:", error)
        // User is not authenticated
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const userData = await authApi.login(email, password)
      setUser(userData)
      // Log the user data to verify it contains the name
      console.log("User data after login:", userData)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "CUSTOMER" | "OWNER") => {
    setIsLoading(true)
    try {
      const userData = await authApi.register(name, email, password, role)
      setUser(userData)
      // Log the user data to verify it contains the name
      console.log("User data after registration:", userData)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

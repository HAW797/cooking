"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "login" | "register"
  setMode: (mode: "login" | "register") => void
}

export function AuthModal({ open, onOpenChange, mode, setMode }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "login") {
        const result = await login(email, password)
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          onOpenChange(false)
          setEmail("")
          setPassword("")
        }
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          toast({
            title: "Error",
            description: "Please enter your first and last name",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
        const result = await register(email, password, firstName, lastName)
        toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        if (result.success) {
          onOpenChange(false)
          setEmail("")
          setPassword("")
          setFirstName("")
          setLastName("")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Welcome Back" : "Join FoodFusion"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Login to access your account and community features"
              : "Create an account to share recipes and connect with food enthusiasts"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {mode === "login" && (
            <p className="text-xs text-muted-foreground">Demo credentials: demo@foodfusion.com / demo123</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" ? "Login" : "Register"}
          </Button>
          <div className="text-center text-sm">
            {mode === "login" ? (
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-primary hover:underline font-medium"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

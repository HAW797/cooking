"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const FIRST_VISIT_KEY = "foodfusion_first_visit"

export function JoinUsModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Check if this is the first visit and user is not authenticated
    if (typeof window !== "undefined" && !isAuthenticated) {
      const hasVisited = localStorage.getItem(FIRST_VISIT_KEY)
      if (!hasVisited) {
        // Show modal after a short delay for better UX
        const timer = setTimeout(() => {
          setOpen(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your first and last name",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const result = await register(email, password, firstName, lastName)
      toast({
        title: result.success ? "Welcome to FoodFusion!" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
      if (result.success) {
        setOpen(false)
        // Mark that user has visited
        localStorage.setItem(FIRST_VISIT_KEY, "true")
        setEmail("")
        setPassword("")
        setFirstName("")
        setLastName("")
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

  const handleClose = () => {
    setOpen(false)
    // Mark that user has visited even if they close without registering
    localStorage.setItem(FIRST_VISIT_KEY, "true")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Us at FoodFusion!</DialogTitle>
          <DialogDescription>
            Create your free account to unlock exclusive recipes, share your culinary creations, and connect with food
            enthusiasts worldwide
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-firstName">First Name</Label>
            <Input
              id="join-firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-lastName">Last Name</Label>
            <Input
              id="join-lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-email">Email</Label>
            <Input
              id="join-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-password">Password</Label>
            <Input
              id="join-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join FoodFusion
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

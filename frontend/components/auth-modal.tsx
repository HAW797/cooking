"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
}

export function AuthModal({
  open,
  onOpenChange,
  mode,
  setMode,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null
  );
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login, register, lockoutUntil, getRemainingLockoutTime } = useAuth();
  const { toast } = useToast();

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutUntil && lockoutUntil > Date.now()) {
      setIsLocked(true);
      const interval = setInterval(() => {
        const remaining = getRemainingLockoutTime();
        if (remaining > 0) {
          setCountdown(remaining);
        } else {
          setIsLocked(false);
          setCountdown(0);
          setAttemptsRemaining(null);
          setErrors({});
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsLocked(false);
      setCountdown(0);
    }
  }, [lockoutUntil, getRemainingLockoutTime]);

  // Format countdown time
  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      if (mode === "login") {
        const result = await login(email, password);

         if (result.isLocked) {
           setIsLocked(true);
           setAttemptsRemaining(0);
           setErrors({ password: "Your account is locked. Please wait" });
         } else if (result.errors) {
          setErrors(result.errors);
          if (result.attemptsRemaining !== undefined) {
            setAttemptsRemaining(result.attemptsRemaining);
          }
        }

        if (!result.success && !result.errors && !result.isLocked) {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }

        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          onOpenChange(false);
          setEmail("");
          setPassword("");
          setErrors({});
          setAttemptsRemaining(null);
          setIsLocked(false);
        }
      } else {
        const result = await register(email, password, firstName, lastName);
        if (result.errors) {
          setErrors(result.errors);
        }
        if (!result.success && !result.errors) {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          onOpenChange(false);
          setEmail("");
          setPassword("");
          setFirstName("");
          setLastName("");
          setErrors({});
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Welcome Back" : "Join FoodFusion"}
          </DialogTitle>
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
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) {
                      setErrors((prev) => ({ ...prev, firstName: "" }));
                    }
                  }}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) {
                      setErrors((prev) => ({ ...prev, lastName: "" }));
                    }
                  }}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={errors.email ? "border-red-500" : ""}
              disabled={mode === "login" && isLocked}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                  setAttemptsRemaining(null);
                }
              }}
              className={errors.password ? "border-red-500" : ""}
              disabled={mode === "login" && isLocked}
            />
            {errors.password && (
              <div className="space-y-1 mt-1">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-500">
                    {errors.password}
                    {mode === "login" && isLocked && countdown > 0 && (
                      <span className="font-mono font-bold ml-1">
                        {formatCountdown(countdown)}
                      </span>
                    )}
                  </p>
                </div>
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className="text-sm text-orange-600 font-medium">
                    {attemptsRemaining} attempt
                    {attemptsRemaining !== 1 ? "s" : ""} remaining
                  </p>
                )}
              </div>
            )}
          </div>
          {mode === "login" && !isLocked && (
            <p className="text-xs text-muted-foreground">
              Demo credentials: demo@foodfusion.com / demo123
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || (mode === "login" && isLocked)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login"
              ? isLocked
                ? "Account Locked"
                : "Login"
              : "Register"}
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
  );
}

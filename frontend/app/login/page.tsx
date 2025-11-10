"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION = 3 * 60 * 1000;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Load lockout state from localStorage on mount
  useEffect(() => {
    const storedLockout = localStorage.getItem("login_lockout");
    if (storedLockout) {
      const lockoutData = JSON.parse(storedLockout);
      if (lockoutData.until > Date.now()) {
        setLockoutUntil(lockoutData.until);
        setIsLocked(true);
        setFailedAttempts(lockoutData.attempts || MAX_FAILED_ATTEMPTS);
      } else {
        // Lockout expired, clear it
        localStorage.removeItem("login_lockout");
      }
    }

    const storedAttempts = localStorage.getItem("login_attempts");
    if (storedAttempts) {
      setFailedAttempts(parseInt(storedAttempts));
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (isLocked && lockoutUntil) {
      const interval = setInterval(() => {
        const remaining = lockoutUntil - Date.now();
        if (remaining > 0) {
          setCountdown(remaining);
        } else {
          setIsLocked(false);
          setLockoutUntil(null);
          setFailedAttempts(0);
          setCountdown(0);
          localStorage.removeItem("login_lockout");
          localStorage.removeItem("login_attempts");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutUntil]);

  // Format countdown time
  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Email validation
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if account is locked
    if (isLocked) {
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Please try again in ${formatCountdown(countdown)}.`,
        variant: "destructive",
      });
      return;
    }

    // Required field validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Email format validation
    if (!isEmailValid(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost/api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear failed attempts on successful login
        setFailedAttempts(0);
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("login_lockout");

        // Store token in localStorage
        if (data.data?.token) {
          localStorage.setItem("auth_token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.data?.user?.first_name}!`,
        });

        // Redirect to home page
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        // Handle error response - Check if account exists and credentials are correct
        const errorMessage = data.message || data.error || "Login failed";

        // Check if this is a lockout response from backend
        if (response.status === 423 || errorMessage.toLowerCase().includes("locked")) {
          const newFailedAttempts = MAX_FAILED_ATTEMPTS;
          const lockUntil = Date.now() + LOCKOUT_DURATION;
          
          setFailedAttempts(newFailedAttempts);
          setIsLocked(true);
          setLockoutUntil(lockUntil);
          
          localStorage.setItem("login_lockout", JSON.stringify({
            until: lockUntil,
            attempts: newFailedAttempts
          }));
          localStorage.setItem("login_attempts", newFailedAttempts.toString());

          toast({
            title: "Account Locked",
            description: "Too many failed login attempts. Your account has been locked for 3 minutes.",
            variant: "destructive",
          });
        } else {
          // Increment failed attempts
          const newFailedAttempts = failedAttempts + 1;
          setFailedAttempts(newFailedAttempts);
          localStorage.setItem("login_attempts", newFailedAttempts.toString());

          if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            // Lock the account
            const lockUntil = Date.now() + LOCKOUT_DURATION;
            setIsLocked(true);
            setLockoutUntil(lockUntil);
            
            localStorage.setItem("login_lockout", JSON.stringify({
              until: lockUntil,
              attempts: newFailedAttempts
            }));

            toast({
              title: "Account Locked",
              description: "Too many failed login attempts. Your account has been locked for 3 minutes.",
              variant: "destructive",
            });
          } else {
            const attemptsRemaining = MAX_FAILED_ATTEMPTS - newFailedAttempts;
            
            toast({
              title: "Login Failed",
              description: `${errorMessage}. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Welcome Back
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Log in to access your account and continue your culinary journey.
              </p>
            </div>
          </div>
        </section>

        {/* Login Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LogIn className="h-6 w-6 text-primary" />
                    <CardTitle>Login</CardTitle>
                  </div>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Lockout Warning */}
                    {isLocked && lockoutUntil && (
                      <div className="bg-red-500/10 p-3 rounded-md border border-red-500/20">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <div className="text-sm text-red-500">
                            <p className="font-medium">Account Locked</p>
                            <p>
                              Too many failed login attempts. Please try again in{" "}
                              <span className="font-mono font-bold">
                                {formatCountdown(countdown)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Failed Attempts Warning */}
                    {!isLocked && failedAttempts > 0 && (
                      <div className="bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <p className="text-sm text-yellow-700">
                            <span className="font-bold">
                              {MAX_FAILED_ATTEMPTS - failedAttempts} attempt
                              {MAX_FAILED_ATTEMPTS - failedAttempts !== 1 ? "s" : ""} remaining
                            </span>{" "}
                            before account lockout
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLocked}
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLocked}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || isLocked}
                    >
                      {isLocked ? "Account Locked" : isLoading ? "Logging in..." : "Log In"}
                    </Button>

                    {/* Register Link */}
                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <a
                        href="/register"
                        className="text-primary hover:underline font-medium"
                      >
                        Register here
                      </a>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


"use client";

import type React from "react";

import { useState } from "react";
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
import { UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Email validation
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required field validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
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

    // Password format validation
    if (!isPasswordValid) {
      toast({
        title: "Invalid Password",
        description: "Password does not meet all requirements",
        variant: "destructive",
      });
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost/api/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. You can now log in.",
        });

        // Reset form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Handle error response
        const errorMessage =
          data.message || data.error || "Registration failed";

        // Check if account already exists
        if (errorMessage.toLowerCase().includes("already registered")) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please log in.",
            variant: "destructive",
          });
        } else if (data.errors && Array.isArray(data.errors)) {
          // Display validation errors
          toast({
            title: "Validation Error",
            description: data.errors.join(", "),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: errorMessage,
            variant: "destructive",
          });
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
                Create Your Account
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join our culinary community and start sharing your favorite
                recipes with food lovers around the world.
              </p>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-6 w-6 text-primary" />
                    <CardTitle>Register</CardTitle>
                  </div>
                  <CardDescription>
                    Fill in your details to create a new account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

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
                        required
                      />
                      {email && !isEmailValid(email) && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Please enter a valid email address
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* Password Requirements */}
                    {password && (
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Password Requirements:
                        </p>
                        <div className="space-y-1">
                          <PasswordRequirement
                            met={passwordChecks.length}
                            text="At least 8 characters"
                          />
                          <PasswordRequirement
                            met={passwordChecks.uppercase}
                            text="At least one uppercase letter"
                          />
                          <PasswordRequirement
                            met={passwordChecks.lowercase}
                            text="At least one lowercase letter"
                          />
                          <PasswordRequirement
                            met={passwordChecks.number}
                            text="At least one number"
                          />
                          <PasswordRequirement
                            met={passwordChecks.special}
                            text="At least one special character"
                          />
                        </div>
                      </div>
                    )}

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>

                    {/* Login Link */}
                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <a
                        href="/login"
                        className="text-primary hover:underline font-medium"
                      >
                        Log in here
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

// Helper component for password requirements
function PasswordRequirement({
  met,
  text,
}: {
  met: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      <span className={met ? "text-green-600" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
}





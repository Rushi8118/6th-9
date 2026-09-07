"use client"

import { useState } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { User, Mail, Lock, UserPlus, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPasswordStrength } from "@/lib/validations/auth"
import { PasswordRequirements } from "@/components/password-requirements"
import { toast } from "sonner"

export default function RegisterPage() {
  const { signUp, signInWithGoogle, user } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" replace />
  }

  const passwordStrength = getPasswordStrength(password)

  const getStrengthBarColor = (level: string) => {
    switch (level) {
      case "Weak":
        return "bg-destructive"
      case "Fair":
        return "bg-warning"
      case "Good":
        return "bg-info"
      case "Strong":
        return "bg-emerald-500 animate-pulse"
      default:
        return "bg-border"
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", {
        description: "Please make sure both passwords are identical.",
      })
      return
    }

    if (passwordStrength.score < 4) {
      toast.error("Please choose a stronger password.", {
        description: "Your password must meet at least 4 security constraints.",
      })
      return
    }

    if (!agreeTerms) {
      toast.error("Please accept the terms and conditions.", {
        description: "You must agree to our terms to create an account.",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await signUp(email, password, fullName)
      if (error) {
        toast.error((error as any)?.message || "Failed to create account.")
      } else {
        const session = (data as any)?.session
        if (session) {
          toast.success("Account created successfully!", {
            description: "Welcome! Redirecting to home page...",
          })
          navigate("/")
        } else {
          toast.success("Account created successfully!", {
            description: "Please check your inbox to verify your email, then sign in.",
            duration: 6000,
          })
          navigate("/login")
        }
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        if ((error as any)?.message?.includes("popup_closed")) {
          toast.error("Sign-in cancelled.", {
            description: "You closed the popup before completing sign-in.",
          })
        } else if (error.message?.includes("access_denied")) {
          toast.error("Access denied.", {
            description: "You denied the permission request.",
          })
        } else {
          toast.error(error.message || "Google sign-in failed.")
        }
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred during Google Sign-In.")
      console.error(err)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Register | Siddhivinayak Overseas</title>
        <meta
          name="description"
          content="Create an account with Siddhivinayak Overseas. Apply for work visa or study visa and track progress in real-time."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <SiteHeader />
      <main className="relative min-h-screen bg-background flex flex-col justify-center py-24 px-4 md:px-6 premium-page">
        {/* Soft background light wash */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/4 -z-10 h-[500px] w-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.16 84 / 0.12) 0%, transparent 65%)",
          }}
        />

        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border/60 bg-card/65 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-center mb-6">
              <h1 className="font-serif text-3xl font-semibold leading-tight text-foreground">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Register to apply and manage your visa processing profiles
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your Full Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 border-border/70 bg-background/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-border/70 bg-background/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-11 border-border/70 bg-background/50 focus:border-primary/50"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Password strength UI */}
                {password.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className="font-semibold text-foreground">{passwordStrength.level}</span>
                    </div>

                    {/* Strengths bar */}
                    <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-full rounded-full transition-all duration-300 ${idx < passwordStrength.score
                            ? getStrengthBarColor(passwordStrength.level)
                            : "bg-transparent"
                            }`}
                        />
                      ))}
                    </div>

                    <PasswordRequirements strength={passwordStrength} />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-11 border-border/70 bg-background/50 focus:border-primary/50"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-nowrap items-center gap-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="size-4 shrink-0"
                />

                <Label htmlFor="terms" className="inline text-sm whitespace-nowrap">I agree to the <Link to="/terms" className="text-primary hover:underline whitespace-nowrap">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline whitespace-nowrap">Privacy Policy</Link></Label>
              </div>

              <Button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-full bg-primary hover:bg-primary/95 text-primary-foreground btn-glow mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <GoogleSignInButton
              onClick={handleGoogleLogin}
              isLoading={googleLoading}
              disabled={loading}
            />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}


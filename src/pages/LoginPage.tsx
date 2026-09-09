"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, Navigate, useSearchParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { Mail, Lock, LogIn, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { toast } from "sonner"

export default function LoginPage() {
  const { signIn, signInWithGoogle, user, profile, isLoading, canAccessAdmin } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get("redirect")

  const postLoginPath = () => {
    if (redirectParam) return redirectParam
    if (canAccessAdmin) return "/admin"
    return "/dashboard"
  }

  // If already logged in (and profile hydrated), send them onward.
  if (user && !isLoading && profile) {
    return <Navigate to={postLoginPath()} replace />
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please enter both email and password.")
      return
    }
    if (!agreeTerms) {
      toast.error("Please agree to the Terms & Conditions to continue.")
      return
    }

    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error((error as { message?: string })?.message || "Failed to log in.")
        return
      }
      toast.success("Welcome back!", {
        description: "Successfully logged in to your account.",
      })
      // AuthProvider hydrates the profile before resolving signIn, so choose the
      // destination from the current role instead of briefly routing to /dashboard.
      navigate(redirectParam || (canAccessAdmin ? "/admin" : "/dashboard"), { replace: true })
    } catch (err: unknown) {
      toast.error("An unexpected error occurred.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // After successful password login, AuthProvider updates canAccessAdmin — redirect once ready.
  useEffect(() => {
    if (!loading && user && !isLoading && profile) {
      navigate(postLoginPath(), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, isLoading, canAccessAdmin])

  const handleGoogleLogin = async () => {
    if (!agreeTerms) {
      toast.error("Please agree to the Terms & Conditions to continue.")
      return
    }
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        const msg = (error as { message?: string })?.message || ""
        if (msg.includes("popup_closed")) {
          toast.error("Sign-in cancelled.", {
            description: "You closed the popup before completing sign-in.",
          })
        } else if (msg.includes("access_denied")) {
          toast.error("Access denied.", {
            description: "You denied the permission request.",
          })
        } else {
          toast.error(msg || "Google sign-in failed.")
        }
      }
    } catch (err: unknown) {
      toast.error("An unexpected error occurred during Google Sign-In.")
      console.error(err)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login | Siddhivinayak Overseas</title>
        <meta
          name="description"
          content="Access your immigration applications and consultations portal. Secure login for Siddhivinayak Overseas."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <SiteHeader />
      <main className="relative min-h-screen bg-background flex flex-col justify-center py-20 px-4 md:px-6 premium-page">
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
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-semibold leading-tight text-foreground">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to track your visa applications and consultations
              </p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    autoComplete="current-password"
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
              </div>

              <div className="flex flex-nowrap items-start gap-2.5 pt-1">
                <Checkbox
                  id="terms-login"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-0.5 size-4 shrink-0"
                />
                <Label
                  htmlFor="terms-login"
                  className="inline cursor-pointer text-xs leading-tight text-muted-foreground sm:text-sm"
                >
                  I agree to the <Link to="/terms" className="text-primary hover:underline whitespace-nowrap">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline whitespace-nowrap">Privacy Policy</Link>.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading || googleLoading || isLoading}
                className="w-full rounded-full bg-primary hover:bg-primary/95 text-primary-foreground btn-glow mt-2"
              >
                {loading || (user && isLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
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

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

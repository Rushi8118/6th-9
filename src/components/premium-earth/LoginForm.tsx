import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Premium-styled sign-in form, wired to the real Supabase auth flow. */
export function LoginForm() {
  const { signIn, signInWithGoogle, user, profile, isLoading, canAccessAdmin } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
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

  if (user && !isLoading && profile) {
    return <Navigate to={postLoginPath()} replace />
  }

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {}
    if (!email) nextErrors.email = "Email address is required."
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = "Enter a valid email address."
    if (!password) nextErrors.password = "Password is required."
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters."
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error((error as { message?: string })?.message || "Failed to sign in.")
        return
      }
      toast.success("Welcome back!")
      navigate(redirectParam || (canAccessAdmin ? "/admin" : "/dashboard"), { replace: true })
    } catch (err) {
      toast.error("An unexpected error occurred.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) toast.error((error as { message?: string })?.message || "Google sign-in failed.")
    } catch (err) {
      toast.error("An unexpected error occurred during Google sign-in.")
      console.error(err)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h1 className="font-serif text-3xl font-semibold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-white/60">Sign in to continue your overseas journey.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-white/80">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#e8b84b]/60"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-white/80">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-[#e8b84b] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#e8b84b]/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/40 transition hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
        </div>

        <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-white/70">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/30 bg-white/5 accent-[#e8b84b]"
          />
          Remember me
        </label>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e8b84b] to-[#f5d78e] text-sm font-semibold text-[#0b1530] shadow-lg shadow-[#e8b84b]/20 transition disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in to portal
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-white/40">
          <span className="bg-[#070d1c] px-3">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton onClick={handleGoogle} isLoading={googleLoading} disabled={loading} />

      <p className="mt-8 text-center text-sm text-white/60">
        New to Siddhivinayak Overseas?{" "}
        <Link to="/register-preview" className="font-semibold text-[#e8b84b] hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}

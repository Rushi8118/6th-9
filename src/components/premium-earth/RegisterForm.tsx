import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { DESTINATIONS } from "@/data/destinations"
import { cn } from "@/lib/utils"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PATHWAYS = [
  { id: "study", label: "Study" },
  { id: "work", label: "Work" },
] as const

type FormErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword" | "destination" | "pathway" | "terms", string>>

/** Premium-styled registration form, wired to the real Supabase sign-up flow. */
export function RegisterForm() {
  const { signUp, signInWithGoogle, user } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [destinationId, setDestinationId] = useState("")
  const [pathway, setPathway] = useState<(typeof PATHWAYS)[number]["id"] | "">("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" replace />
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!fullName.trim()) nextErrors.fullName = "Full name is required."
    if (!email) nextErrors.email = "Email address is required."
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = "Enter a valid email address."
    if (!password) nextErrors.password = "Password is required."
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters."
    if (confirmPassword !== password || !confirmPassword) nextErrors.confirmPassword = "Passwords do not match."
    if (!destinationId) nextErrors.destination = "Choose a preferred destination."
    if (!pathway) nextErrors.pathway = "Choose a pathway."
    if (!agreeTerms) nextErrors.terms = "You must accept the terms to continue."
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { data, error } = await signUp(email, password, fullName)
      if (error) {
        toast.error((error as { message?: string })?.message || "Failed to create account.")
        return
      }
      const session = (data as { session?: unknown } | null)?.session
      toast.success("Account created!", {
        description: session ? "Welcome aboard." : "Check your inbox to verify your email, then sign in.",
      })
      navigate(session ? "/" : "/login-preview")
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
      <h1 className="font-serif text-3xl font-semibold text-white">Start your journey</h1>
      <p className="mt-2 text-sm text-white/60">Create your account and take the first step toward your global future.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="register-name" className="text-sm font-medium text-white/80">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              id="register-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#e8b84b]/60"
            />
          </div>
          {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className="text-sm font-medium text-white/80">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#e8b84b]/60"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="register-password" className="text-sm font-medium text-white/80">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
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

          <div className="space-y-1.5">
            <label htmlFor="register-confirm-password" className="text-sm font-medium text-white/80">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#e8b84b]/60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/40 transition hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-destination" className="text-sm font-medium text-white/80">
            Preferred destination
          </label>
          <select
            id="register-destination"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-[#e8b84b]/60"
          >
            <option value="" className="bg-[#0b1530]">Select a destination</option>
            {DESTINATIONS.map((destination) => (
              <option key={destination.id} value={destination.id} className="bg-[#0b1530]">
                {destination.city}, {destination.country}
              </option>
            ))}
          </select>
          {errors.destination && <p className="text-xs text-red-400">{errors.destination}</p>}
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-white/80">Study or work pathway</p>
          <div className="flex gap-3">
            {PATHWAYS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPathway(option.id)}
                className={cn(
                  "min-h-[44px] flex-1 rounded-xl border px-4 text-sm font-semibold transition",
                  pathway === option.id
                    ? "border-[#e8b84b]/60 bg-[#e8b84b]/10 text-[#e8b84b]"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.pathway && <p className="text-xs text-red-400">{errors.pathway}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="flex min-h-[44px] cursor-pointer items-start gap-2.5 text-sm text-white/70">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/5 accent-[#e8b84b]"
            />
            I agree to the terms of service and privacy policy.
          </label>
          {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e8b84b] to-[#f5d78e] text-sm font-semibold text-[#0b1530] shadow-lg shadow-[#e8b84b]/20 transition disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create my account
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
        Already have an account?{" "}
        <Link to="/login-preview" className="font-semibold text-[#e8b84b] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/use-auth'
import UserAvatar from '@/components/UserAvatar'
import {
  User,
  Phone,
  MapPin,
  Lock,
  Camera,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const { user } = useAuth()
  const {
    profile,
    updateProfile,
    updateLoading,
    uploadAvatar,
    uploadLoading,
    updatePassword,
    passwordLoading,
    deleteAccount,
    deleteLoading,
  } = useProfile()

  // Form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Modal deletion double confirmation
  const [deleteModal, setDeleteModal] = useState(false)
  const deleteDialogRef = useRef<HTMLDivElement>(null)

  // Initialize fields
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setWhatsapp(profile.whatsapp || '')
      setCity(profile.current_city || '')
      setCountry(profile.current_country || '')
    }
  }, [profile])

  useEffect(() => {
    if (!deleteModal) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    deleteDialogRef.current?.querySelector<HTMLElement>('button')?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDeleteModal(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [deleteModal])

  if (!user) return null

  // Check if provider is Google OAuth
  const isGoogleUser = user.app_metadata?.provider === 'google' || 
    user.identities?.some((identity) => identity.provider === 'google')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      full_name: fullName,
      phone,
      whatsapp,
      current_city: city,
      current_country: country,
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAvatar(e.target.files[0])
    }
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }
    updatePassword(password, {
      onSuccess: () => {
        setPassword('')
        setConfirmPassword('')
      },
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      
      {/* Top Header Card with Profile Photo upload */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4.5">
          {/* Circular avatar upload preview */}
          <div className="relative group shrink-0 select-none">
            <UserAvatar
              imageUrl={profile?.profile_photo_url}
              fullName={profile?.full_name || user.email}
              size="lg"
              className="border-2 border-[#C49A2B]/40 group-hover:opacity-90 transition"
            />
            <label
              htmlFor="avatar-file-input"
              className="absolute inset-0 bg-black/40 text-[#F5F0E8] rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition duration-200"
              aria-label="Change profile photo"
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
            </label>
            <input
              type="file"
              id="avatar-file-input"
              onChange={handleAvatarChange}
              disabled={uploadLoading}
              className="hidden"
              accept="image/*"
            />
            {uploadLoading && (
              <span className="absolute inset-0 bg-[#1a1a2e]/60 rounded-full flex items-center justify-center text-xs font-bold text-white leading-none">
                Updating...
              </span>
            )}
          </div>

          <div className="leading-tight text-center sm:text-left space-y-1">
            <h2 className="font-serif text-lg font-bold text-[#1a1a2e]">
              {profile?.full_name || 'Applicant Credentials'}
            </h2>
            <p className="text-xs text-foreground/65">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1.5">
              {isGoogleUser ? (
                <span className="bg-blue-600/15 text-blue-800 border border-blue-600/30 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Connected with Google
                </span>
              ) : (
                <span className="bg-[#1a1a2e]/5 text-foreground/70 border border-border text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Standard Email Account
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form details */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 shadow-sm space-y-4.5">
          <h3 className="font-serif text-base font-bold text-[#1a1a2e] border-b border-border/30 pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-[#C49A2B]" /> Personal Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-xs h-10 border-border/60 bg-[#F5F0E8]/20 focus:border-[#C49A2B]/40 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="e.g. +91 99250"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-10 border-border/60 bg-[#F5F0E8]/20 focus:border-[#C49A2B]/40 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="text"
                  placeholder="e.g. +91 99250"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="text-xs h-10 border-border/60 bg-[#F5F0E8]/20 focus:border-[#C49A2B]/40 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="city">Current City</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs h-10 border-border/60 bg-[#F5F0E8]/20 focus:border-[#C49A2B]/40 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Current Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="text-xs h-10 border-border/60 bg-[#F5F0E8]/20 focus:border-[#C49A2B]/40 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateLoading}
              className="rounded-xl h-10.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold w-full btn-glow"
            >
              {updateLoading ? 'Saving Profile...' : 'Save Profile Details'}
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          {/* Reset Password form (Hides for Google OAuth) */}
          {!isGoogleUser && (
            <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-[#1a1a2e] border-b border-border/30 pb-3 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-[#C49A2B]" /> Password Security
              </h3>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-xs h-10 border-border/60 bg-[#F5F0E8]/20 focus:border-[#C49A2B]/40 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-xs h-10 border-border/60 bg-[#F5F0E8]/20 focus:border-[#C49A2B]/40 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-xl h-10.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold w-full"
                >
                  {passwordLoading ? 'Resetting...' : 'Change Account Password'}
                </Button>
              </form>
            </div>
          )}

          {/* Delete Danger Zone Panel */}
          <div className="bg-card border border-red-500/10 rounded-2xl p-5 shadow-sm space-y-3.5">
            <h3 className="font-serif text-base font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> Danger Zone
            </h3>
            <p className="text-xs text-foreground/65 leading-normal">
              Permanently close and deactivate your Siddhivinayak applicant records. All documents uploaded to Supabase Storage will be purged.
            </p>
            <Button
              onClick={() => setDeleteModal(true)}
              className="w-full h-11 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl text-sm font-bold shadow-sm transition"
            >
              Delete Account Permanently
            </Button>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div
          className="fixed inset-0 bg-[#1a1a2e]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          role="presentation"
          onClick={() => setDeleteModal(false)}
        >
          <div
            ref={deleteDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-desc"
            className="bg-card border border-border/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-red-100 text-red-700 rounded-full inline-flex items-center justify-center" aria-hidden="true">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 id="delete-dialog-title" className="font-serif text-lg font-bold text-[#1a1a2e]">
                Delete Account?
              </h3>
              <p id="delete-dialog-desc" className="text-sm text-foreground/65 leading-normal">
                This is a destructive action that cannot be undone. You will lose access to all visa progress timelines.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteModal(false)}
                className="flex-1 rounded-xl h-11 text-sm font-semibold"
              >
                No, Keep
              </Button>
              <Button
                onClick={() => {
                  deleteAccount()
                  setDeleteModal(false)
                }}
                disabled={deleteLoading}
                className="flex-1 rounded-xl h-11 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold"
              >
                {deleteLoading ? 'Deactivating...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

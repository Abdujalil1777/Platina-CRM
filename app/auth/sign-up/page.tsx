"use client"


import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GradientMeshBackground } from '@/components/gradient-mesh-background'
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Parollar mos kelmadi')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6">
      <GradientMeshBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glass-strong">
            <span className="text-2xl font-bold text-primary">P</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground text-glow">Platina</h1>
          <p className="mt-1 text-sm text-muted-foreground">{"O'quv Markazi CRM"}</p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-strong rounded-3xl p-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">{"Ro'yxatdan o'tish"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Yangi hisob yaratish uchun ma&apos;lumotlarni kiriting
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName" className="text-sm text-foreground/80">To&apos;liq ism</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ismingiz"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input h-12 rounded-xl pl-10 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm text-foreground/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@platina.uz"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input h-12 rounded-xl pl-10 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm text-foreground/80">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Kamida 6 belgi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input h-12 rounded-xl pl-10 pr-10 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Repeat Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="repeatPassword" className="text-sm text-foreground/80">Parolni tasdiqlash</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="repeatPassword"
                  type="password"
                  required
                  placeholder="Parolni qayta kiriting"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="glass-input h-12 rounded-xl pl-10 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive glass-subtle rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {"Yaratilmoqda..."}
                </>
              ) : (
                'Ro\'yxatdan o\'tish'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {"Allaqachon hisobingiz bormi? "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Kirish
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

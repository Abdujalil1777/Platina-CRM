import Link from 'next/link'
import { GradientMeshBackground } from '@/components/gradient-mesh-background'
import { CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6">
      <GradientMeshBackground />

      <div className="w-full max-w-md text-center">
        <div className="glass-strong rounded-3xl p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'oklch(0.72 0.19 155 / 0.2)' }}>
            <CheckCircle className="h-10 w-10" style={{ color: 'oklch(0.72 0.19 155)' }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {"Ro'yxatdan o'tdingiz!"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Emailingizga tasdiqlash xabari yuborildi. Iltimos, emailingizni tekshirib, hisobingizni tasdiqlang.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Kirishga qaytish
          </Link>
        </div>
      </div>
    </div>
  )
}

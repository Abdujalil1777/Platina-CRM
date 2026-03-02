import Link from 'next/link'
import { GradientMeshBackground } from '@/components/gradient-mesh-background'
import { AlertTriangle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6">
      <GradientMeshBackground />

      <div className="w-full max-w-md text-center">
        <div className="glass-strong rounded-3xl p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'oklch(0.65 0.2 25 / 0.2)' }}>
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Xatolik yuz berdi
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {params?.error
              ? `Xatolik kodi: ${params.error}`
              : "Noma'lum xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."}
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

"use client"

export function GradientMeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.18_0.03_260),oklch(0.1_0.02_260))]" />

      {/* Animated gradient orbs */}
      <div
        className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.2 250 / 0.5), transparent 70%)',
          animation: 'float 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -right-1/4 top-1/4 h-[500px] w-[500px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, oklch(0.6 0.2 330 / 0.4), transparent 70%)',
          animation: 'float-slow 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/4 left-1/3 h-[700px] w-[700px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.18 170 / 0.4), transparent 70%)',
          animation: 'float 30s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-1/2 right-1/3 h-[400px] w-[400px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, oklch(0.65 0.15 60 / 0.3), transparent 70%)',
          animation: 'float-slow 22s ease-in-out infinite',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }} />
    </div>
  )
}

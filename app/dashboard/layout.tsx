import { GradientMeshBackground } from "@/components/gradient-mesh-background"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <GradientMeshBackground />
      <Sidebar />
      <main className="lg:ml-64">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}

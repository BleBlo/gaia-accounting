import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { OfflineIndicator } from '@/components/layout/offline-indicator'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <OfflineIndicator />
        <main className="py-6 px-4 lg:px-8 pb-24 lg:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
      <Toaster />
    </div>
  )
}

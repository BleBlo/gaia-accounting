'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Receipt,
  CreditCard,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Scissors,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const navigation = [
  { key: 'nav.dashboard', href: '/', icon: Home },
  { key: 'nav.sales', href: '/sales', icon: Receipt },
  { key: 'nav.expenses', href: '/expenses', icon: CreditCard },
  { key: 'settings.services', href: '/services', icon: Scissors },
  { key: 'nav.customers', href: '/customers', icon: Users },
  { key: 'nav.employees', href: '/employees', icon: UserCog },
  { key: 'nav.reports', href: '/reports', icon: BarChart3 },
  { key: 'nav.settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useI18n()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-black border-r border-neutral-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-4 border-b border-neutral-800">
        <Image
          src="/logo.svg"
          alt="GAIA Fashion House"
          width={160}
          height={54}
          className="w-40 h-auto"
          priority
        />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-black' : 'text-neutral-500'
                )} />
                {t(item.key)}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Sign Out */}
      <div className="p-4 border-t border-neutral-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t('auth.signOut')}
        </Button>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Receipt,
  Plus,
  CreditCard,
  BarChart3,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const navigation = [
  { key: 'nav.dashboard', href: '/', icon: Home },
  { key: 'nav.sales', href: '/sales', icon: Receipt },
  { key: 'common.add', href: '/sales/new', icon: Plus, isAction: true },
  { key: 'nav.expenses', href: '/expenses', icon: CreditCard },
  { key: 'nav.reports', href: '/reports', icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-area-inset-bottom z-50">
      <nav className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && !item.isAction && pathname.startsWith(item.href))

          if (item.isAction) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="h-7 w-7 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] py-2',
                isActive ? 'text-black' : 'text-neutral-500'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive ? 'text-black' : 'text-neutral-400'
              )} />
              <span className="text-xs font-medium">{t(item.key)}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

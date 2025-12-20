'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Receipt,
  Users,
  BarChart3,
} from 'lucide-react'

const actions = [
  {
    name: 'New Sale',
    description: 'Record a sale',
    href: '/sales/new',
    icon: Plus,
    variant: 'default' as const,
  },
  {
    name: 'New Expense',
    description: 'Track spending',
    href: '/expenses/new',
    icon: Receipt,
    variant: 'outline' as const,
  },
  {
    name: 'Customers',
    description: 'View customers',
    href: '/customers',
    icon: Users,
    variant: 'outline' as const,
  },
  {
    name: 'Reports',
    description: 'View analytics',
    href: '/reports',
    icon: BarChart3,
    variant: 'outline' as const,
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Button
          key={action.name}
          variant={action.variant}
          asChild
          className={`h-auto py-4 flex-col gap-2 ${
            action.variant === 'default' ? 'bg-black hover:bg-neutral-800 text-white' : 'border-neutral-300 hover:bg-neutral-100'
          }`}
        >
          <Link href={action.href}>
            <action.icon className="h-5 w-5" />
            <span className="font-medium">{action.name}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
}

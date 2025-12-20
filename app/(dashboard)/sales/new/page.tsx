'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SaleForm } from '@/components/sales/sale-form'

export default function NewSalePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sales">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">New Sale</h1>
          <p className="text-sm text-neutral-500">Record a new sale transaction</p>
        </div>
      </div>

      <SaleForm />
    </div>
  )
}

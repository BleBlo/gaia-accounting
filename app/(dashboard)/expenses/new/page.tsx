'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from '@/components/expenses/expense-form'

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/expenses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">New Expense</h1>
          <p className="text-sm text-neutral-500">Record a new expense</p>
        </div>
      </div>

      <ExpenseForm />
    </div>
  )
}

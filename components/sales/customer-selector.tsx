'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Customer, CustomerInsert } from '@/types/database'

interface CustomerSelectorProps {
  customers: Customer[]
  value: string | null
  onSelect: (customerId: string | null) => void
  onAddCustomer: (customer: CustomerInsert) => Promise<Customer | null>
  disabled?: boolean
}

export function CustomerSelector({
  customers,
  value,
  onSelect,
  onAddCustomer,
  disabled
}: CustomerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState<CustomerInsert>({
    name: '',
    phone: '',
    customer_type: 'individual',
  })
  const [saving, setSaving] = useState(false)

  const selectedCustomer = customers.find(c => c.id === value)

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) return

    setSaving(true)
    const customer = await onAddCustomer(newCustomer)
    setSaving(false)

    if (customer) {
      onSelect(customer.id)
      setDialogOpen(false)
      setNewCustomer({ name: '', phone: '', customer_type: 'individual' })
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto py-3 border-neutral-300"
            disabled={disabled}
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-neutral-500" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedCustomer.name}</span>
                  {selectedCustomer.phone && (
                    <span className="text-sm text-neutral-500">{selectedCustomer.phone}</span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-neutral-500">Walk-in customer (optional)</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search customers..." />
            <CommandList>
              <CommandEmpty>No customer found.</CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    onSelect={() => {
                      onSelect(null)
                      setOpen(false)
                    }}
                    className="text-neutral-500"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Walk-in (no customer)
                  </CommandItem>
                )}
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => {
                      onSelect(customer.id === value ? null : customer.id)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-400" />
                      <div className="flex flex-col">
                        <span>{customer.name}</span>
                        {customer.phone && (
                          <span className="text-sm text-neutral-500">{customer.phone}</span>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === customer.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setDialogOpen(true)
                  }}
                  className="text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new customer
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newCustomer.phone || ''}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 50 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Customer Type</Label>
              <Select
                value={newCustomer.customer_type}
                onValueChange={(value) => setNewCustomer(prev => ({
                  ...prev,
                  customer_type: value as 'individual' | 'brand' | 'company'
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomer}
              disabled={!newCustomer.name.trim() || saving}
              className="bg-black hover:bg-neutral-800"
            >
              {saving ? 'Adding...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

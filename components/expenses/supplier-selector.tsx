'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
import type { Supplier, SupplierInsert } from '@/types/database'

interface SupplierSelectorProps {
  suppliers: Supplier[]
  value: string | null
  onSelect: (supplierId: string | null) => void
  onAddSupplier: (supplier: SupplierInsert) => Promise<Supplier | null>
}

export function SupplierSelector({
  suppliers,
  value,
  onSelect,
  onAddSupplier,
}: SupplierSelectorProps) {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_info: '' })
  const [saving, setSaving] = useState(false)

  const selectedSupplier = suppliers.find((s) => s.id === value)

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) return

    setSaving(true)
    const supplier = await onAddSupplier({
      name: newSupplier.name.trim(),
      contact_info: newSupplier.contact_info.trim() || null,
    })
    setSaving(false)

    if (supplier) {
      onSelect(supplier.id)
      setDialogOpen(false)
      setNewSupplier({ name: '', contact_info: '' })
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
            className="w-full justify-between border-neutral-300"
          >
            {selectedSupplier ? (
              <span>{selectedSupplier.name}</span>
            ) : (
              <span className="text-neutral-500">Select supplier...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search suppliers..." />
            <CommandList>
              <CommandEmpty>
                <p className="text-sm text-neutral-500">No supplier found.</p>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setDialogOpen(true)
                  }}
                  className="text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new supplier
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Suppliers">
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={supplier.name}
                    onSelect={() => {
                      onSelect(supplier.id === value ? null : supplier.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === supplier.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {supplier.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Name *</Label>
              <Input
                id="supplier-name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-contact">Contact Info</Label>
              <Input
                id="supplier-contact"
                value={newSupplier.contact_info}
                onChange={(e) => setNewSupplier((prev) => ({ ...prev, contact_info: e.target.value }))}
                placeholder="Phone or email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSupplier}
              disabled={!newSupplier.name.trim() || saving}
              className="bg-black hover:bg-neutral-800"
            >
              {saving ? 'Adding...' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

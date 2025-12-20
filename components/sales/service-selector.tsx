'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import type { Service } from '@/types/database'

interface ServiceSelectorProps {
  services: Service[]
  value: string | null
  onSelect: (service: Service | null) => void
  disabled?: boolean
}

export function ServiceSelector({ services, value, onSelect, disabled }: ServiceSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedService = services.find(s => s.id === value)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-3 border-neutral-300"
          disabled={disabled}
        >
          {selectedService ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedService.name_en}</span>
              <span className="text-sm text-neutral-500">
                {selectedService.is_variable_price
                  ? `${formatPrice(selectedService.min_price || 0)} - ${formatPrice(selectedService.max_price || 0)}`
                  : formatPrice(selectedService.default_price)}
              </span>
            </div>
          ) : (
            <span className="text-neutral-500">Select service...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search services..." />
          <CommandList>
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup>
              {services.map((service) => (
                <CommandItem
                  key={service.id}
                  value={service.name_en}
                  onSelect={() => {
                    onSelect(service.id === value ? null : service)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{service.name_en}</span>
                    {service.name_tr && (
                      <span className="text-sm text-neutral-500">{service.name_tr}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {service.is_variable_price
                        ? `${formatPrice(service.min_price || 0)}+`
                        : formatPrice(service.default_price)}
                    </span>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === service.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Menu, Search, Bell, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Home,
  Receipt,
  CreditCard,
  Users,
  UserCog,
  BarChart3,
  Scissors,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
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

export function Header() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { t } = useI18n()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center gap-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-black border-neutral-800">
              <SheetHeader className="p-4 border-b border-neutral-800">
                <SheetTitle className="sr-only">GAIA Fashion House</SheetTitle>
                <Image
                  src="/logo.svg"
                  alt="GAIA Fashion House"
                  width={160}
                  height={50}
                  className="h-12 w-auto"
                />
              </SheetHeader>
              <ScrollArea className="flex-1 py-4">
                <nav className="px-3 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href))

                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setOpen(false)}
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
            </SheetContent>
          </Sheet>

          {/* Mobile logo */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-light tracking-widest text-black">GAIA</span>
          </div>
        </div>

        {/* Search (desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search sales, customers..."
              className="pl-10 bg-neutral-50 border-neutral-200"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-neutral-500" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-black text-white">
                    G
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

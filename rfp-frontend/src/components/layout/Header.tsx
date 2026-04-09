'use client'

import { useEffect, useState } from 'react'
import { Bell, Search, LogOut } from 'lucide-react'
import { User } from '@/lib/mocks/rfpData'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('rfp_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  if (!user) return <header className="h-16 border-b border-zinc-200 bg-white" />

  const handleLogout = () => {
    localStorage.removeItem('rfp_user')
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-zinc-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2">
        <span className="text-zinc-900 font-semibold text-sm mr-2 hidden md:block">Enterprise SaaS RFP Automation</span>
        <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-500 border border-zinc-200">v1.2</span>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search RFPs, clients, or requirements..." 
            className="w-full pl-9 bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-400 h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-zinc-500 hover:text-zinc-900 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar className="w-8 h-8 rounded-full border border-zinc-200">
              <AvatarFallback className="bg-white text-zinc-900 font-semibold text-xs text-black border border-zinc-200">{user.initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-zinc-200 shadow-lg rounded-lg">
            <DropdownMenuItem className="text-sm cursor-pointer py-2 hover:bg-zinc-50 focus:bg-zinc-50">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm cursor-pointer py-2 hover:bg-zinc-50 focus:bg-zinc-50">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600 cursor-pointer py-2 hover:bg-red-50 focus:bg-red-50 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

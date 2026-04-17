'use client'

import { useEffect, useState } from 'react'
import { Bell, Search, LogOut, User as UserIcon, Settings as SettingsIcon, PanelLeftOpen } from 'lucide-react'
import { User } from '@/lib/mocks/rfpData'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  showSidebarToggle?: boolean
  onSidebarToggle?: () => void
}

export function Header({ showSidebarToggle, onSidebarToggle }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasNotifications, setHasNotifications] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('rfp_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }

    async function fetchNotifications() {
      try {
        const { fetchApi } = await import('@/lib/api')
        const data = await fetchApi('/rfps/notifications')
        setNotifications(data || [])
        setHasNotifications(data.some((n: any) => !n.is_read))
      } catch (e) {
        console.error("Failed to fetch notifications", e)
      }
    }
    
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const markRead = async (id: number) => {
    try {
      const { fetchApi } = await import('@/lib/api')
      await fetchApi(`/rfps/notifications/${id}/read`, { method: 'POST' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {}
  }

  if (!user) return <header className="h-16 border-b border-zinc-200 bg-white" />

  const handleLogout = () => {
    localStorage.removeItem('rfp_user')
    router.push('/login')
  }

  const dashboardPath = user.role === 'pm' ? '/dashboard/ceo' : '/dashboard/architect'

  return (
    <header className="h-16 border-b border-zinc-200 bg-white px-8 flex items-center justify-between sticky top-0 z-40 w-full transition-all duration-300">
      <div className="flex items-center gap-4">
        {showSidebarToggle && (
          <button 
            onClick={onSidebarToggle}
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all animate-in fade-in slide-in-from-left-2"
            title="Show Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-zinc-900 font-semibold text-sm mr-2 hidden md:block">Enterprise SaaS RFP Automation</span>
          <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-500 border border-zinc-200">v1.2</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search RFPs, clients, or requirements..." 
            className="w-full pl-9 bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-400 h-9"
            defaultValue={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : ''}
            onChange={(e) => {
              const term = e.target.value
              const url = new URL(window.location.href)
              if (term) {
                url.searchParams.set('q', term)
              } else {
                url.searchParams.delete('q')
              }
              // Push to router safely while preserving current state
              router.replace(url.pathname + url.search)
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <DropdownMenu onOpenChange={(open) => { if (open) setHasNotifications(false) }}>
          <DropdownMenuTrigger asChild>
            <button className="text-zinc-500 hover:text-zinc-900 relative outline-none">
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white border border-zinc-200 shadow-lg rounded-xl p-0 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <p className="text-sm font-bold text-zinc-900">Notifications</p>
              {notifications.length > 0 && (
                <span className="text-[10px] font-black uppercase text-zinc-400">{notifications.length} total</span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "p-4 border-b border-zinc-50 cursor-pointer hover:bg-zinc-50 transition-colors relative",
                      !n.is_read && "bg-blue-50/30"
                    )}
                  >
                    {!n.is_read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />}
                    <p className={cn("text-xs leading-relaxed", !n.is_read ? "text-zinc-900 font-bold" : "text-zinc-500 font-medium")}>
                      {n.message}
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-2 font-black uppercase tracking-widest">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-zinc-300" />
                  </div>
                  <p className="text-sm font-medium text-zinc-900">All caught up!</p>
                  <p className="text-xs text-zinc-500">No more notifications for now.</p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar className="w-8 h-8 rounded-full border border-zinc-200">
              <AvatarFallback className="bg-white text-zinc-900 font-semibold text-xs text-black border border-zinc-200">{user.initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-zinc-200 shadow-lg rounded-xl p-1 mt-1">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-100 mx-1" />
            <DropdownMenuItem 
              onClick={() => router.push(`${dashboardPath}/profile`)}
              className="text-sm cursor-pointer py-2 px-3 hover:bg-zinc-50 focus:bg-zinc-50 rounded-lg flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-zinc-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push(`${dashboardPath}/settings`)}
              className="text-sm cursor-pointer py-2 px-3 hover:bg-zinc-50 focus:bg-zinc-50 rounded-lg flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4 text-zinc-500" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 mx-1" />
            <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600 cursor-pointer py-2 px-3 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 rounded-lg flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

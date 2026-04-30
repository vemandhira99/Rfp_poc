'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  Briefcase, 
  FileEdit,
  FolderOpen,
  PanelLeftClose,
  Activity
} from 'lucide-react'
import { User } from '@/lib/mocks/rfpData'

export function Sidebar({ onToggle }: { onToggle?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('rfp_user')
    if (stored) {
      setUser(JSON.parse(stored))
    } else {
      router.push('/login')
    }
  }, [router])

  if (!user) return <div className="w-64 border-r border-zinc-200 bg-zinc-50 h-screen" />

  const isPM = user.role === 'pm'

  const pmLinks = [
    { name: 'Dashboard', href: '/dashboard/ceo', icon: LayoutDashboard },
    { name: 'Approvals / Rejections', href: '/dashboard/ceo/approvals', icon: CheckSquare },
    { name: 'Settings', href: '/dashboard/ceo/settings', icon: Settings },
  ]

  const architectLinks = [
    { name: 'Assigned RFPs', href: '/dashboard/architect', icon: Briefcase },
    { name: 'Workspace', href: '/dashboard/architect/workspace', icon: FolderOpen },
    { name: 'Settings', href: '/dashboard/architect/settings', icon: Settings },
  ]

  const links = isPM ? pmLinks : architectLinks

  return (
    <div className="h-full flex flex-col items-center py-6 px-4 relative overflow-hidden bg-white">
      <div className="w-full mb-10 flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 flex-shrink-0 bg-black rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate leading-tight">
              {isPM ? 'PM / Leadership' : 'Solution Architect'}
            </span>
            <span className="text-xs text-zinc-500 truncate">{user.name}</span>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
          title="Hide Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <nav className="w-full flex-1 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-100 text-zinc-900 font-medium'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          )
        })}
      </nav>

      <QuotaIndicator />
      
      <div className="w-full mt-6 px-2">
      <button
        onClick={() => {
          localStorage.removeItem('rfp_user')
          router.push('/login')
        }}
        className="w-full flex items-center justify-center py-2 text-xs text-zinc-500 border border-zinc-200 rounded-md hover:bg-zinc-50"
      >
        Sign Out
      </button>
      </div>
    </div>
  )
}

function QuotaIndicator() {
  const [quota, setQuota] = useState<{request_count: number, is_exhausted: boolean, health: string} | null>(null)

  useEffect(() => {
    async function fetchQuota() {
      try {
        const { fetchApi } = await import('@/lib/api')
        const data = await fetchApi('/ai/quota-status')
        setQuota(data)
      } catch (e) {
        console.error("Failed to fetch quota", e)
      }
    }
    fetchQuota()
    const interval = setInterval(fetchQuota, 30000) // Every 30s
    return () => clearInterval(interval)
  }, [])

  if (!quota) return null

  return (
    <div className="w-full px-2 mt-4">
      <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Quota Health</span>
          </div>
          <span className={`text-[10px] font-black uppercase ${quota.health === 'Good' ? 'text-emerald-600' : quota.health === 'Warning' ? 'text-amber-600' : 'text-rose-600'}`}>
            {quota.health}
          </span>
        </div>
        
        <div className="space-y-1.5">
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${quota.health === 'Good' ? 'bg-emerald-500' : quota.health === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min((quota.request_count / 100) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-zinc-500">
            <span>{quota.request_count} requests</span>
            <span>Limit: 100/day</span>
          </div>
        </div>
      </div>
    </div>
  )
}

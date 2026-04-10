'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-white text-zinc-900">
      {/* Sidebar with layout transition */}
      <aside 
        className={cn(
          "h-screen border-r border-zinc-300 bg-zinc-50/50 transition-all duration-300 ease-in-out z-50 flex-shrink-0 relative overflow-hidden shadow-sm",
          isSidebarVisible ? "w-64 opacity-100" : "w-0 opacity-0 border-none shadow-none"
        )}
      >
        {/* Wrapper to maintain sidebar width while the parent shrinks */}
        <div className="w-64 h-full">
          <Sidebar onToggle={() => setIsSidebarVisible(false)} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header 
          showSidebarToggle={!isSidebarVisible} 
          onSidebarToggle={() => setIsSidebarVisible(true)} 
        />
        <main className="flex-1 overflow-y-auto bg-zinc-50/30 p-8">
          <div className="max-w-[1400px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function RFPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const params = useParams()
  const id = params.id as string

  // Note: the subnavigation could also be placed above the children in a page, 
  // but keeping it in the layout allows it to persist across RFP sections.
  
  return (
    <div className="flex h-screen overflow-hidden bg-white text-zinc-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 flex flex-col overflow-y-auto bg-zinc-50/30">
          {/* Sub Navigation */}
          <div className="border-b border-zinc-200 bg-white sticky top-0 z-10 px-8 py-3 w-full">
            <div className="max-w-[1400px] mx-auto flex items-center gap-6 overflow-x-auto no-scrollbar">
               <nav className="flex items-center gap-6">
                {[
                  { name: 'Overview', href: `/rfp/${id}/overview` },
                  { name: 'Architect Workspace', href: `/rfp/${id}/draft` },
                  { name: 'Compliance Matrix', href: `/rfp/${id}/compliance` },
                  { name: 'Final Review', href: `/rfp/${id}/review` },
                  { name: 'Export & Share', href: `/rfp/${id}/export` },
                ].map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap pb-3 -mb-[13px] border-b-2 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

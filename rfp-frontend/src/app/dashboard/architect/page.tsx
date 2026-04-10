'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, User, Folder, Award, Timer, ShieldCheck, Zap } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

function AssignedRfpsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q')?.toLowerCase() || ''

  const allRfps = [
    {
      id: "rfp-1",
      title: "Enterprise Cloud Migration Platform",
      client: "Global Tech Corp",
      deadline: "2026-04-25",
      daysLeft: 15,
      complexity: "High",
      complexityType: "high",
      status: "In Progress",
      statusType: "progress",
      assignedBy: "Yash Kanvinde",
      description: "Complete transition of on-premise infrastructure to AWS with zero-downtime requirements."
    },
    {
      id: "rfp-2",
      title: "Healthcare Data Analytics Solution",
      client: "MediCare Systems",
      deadline: "2026-04-15",
      daysLeft: 5,
      complexity: "Critical",
      complexityType: "critical",
      status: "New",
      statusType: "new",
      assignedBy: "Michael Chen",
      description: "HIPAA-compliant analytics platform for real-time patient data processing and reporting."
    },
    {
      id: "rfp-3",
      title: "Retail CX Portal",
      client: "RetailMax",
      deadline: "2026-05-10",
      daysLeft: 30,
      complexity: "Medium",
      complexityType: "medium",
      status: "Review",
      statusType: "review",
      assignedBy: "Yash Kanvinde",
      description: "Customer experience portal integrating loyalty programs and omnichannel support."
    }
  ]

  const rfps = allRfps.filter(rfp => rfp.title.toLowerCase().includes(q) || rfp.client.toLowerCase().includes(q))

  return (
    <div className="space-y-8 pb-10 pt-2 min-h-screen w-full relative">
      <div className="absolute inset-0 gradient-bg -z-10 rounded-3xl opacity-30 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-200/50">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 leading-none mb-4">Assigned RFPs</h1>
          <p className="text-zinc-500 text-sm font-medium max-w-lg">
            Manage and respond to high-priority RFP requests assigned for your technical expertise.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Active</p>
            <p className="text-2xl font-black text-indigo-600 leading-none">{rfps.length}</p>
          </div>
          <div className="h-10 w-px bg-zinc-200" />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Due This Week</p>
            <p className="text-2xl font-black text-rose-500 leading-none">1</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {rfps.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-100">
               <Search className="w-6 h-6 text-zinc-300" />
            </div>
            <p className="text-zinc-500 text-sm font-bold">No RFPs match your search "{q}".</p>
          </div>
        ) : (
          rfps.map((rfp) => (
            <Card key={rfp.id} className="glass-card hover-lift rounded-3xl overflow-hidden border-white/60 group shadow-lg shadow-zinc-200/20">
              <CardContent className="p-0">
                <div className="flex flex-col xl:flex-row">
                  {/* Left Section: Info */}
                  <div className="flex-1 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        rfp.statusType === 'new' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                        rfp.statusType === 'progress' && "bg-indigo-50 text-indigo-600 border border-indigo-100",
                        rfp.statusType === 'review' && "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {rfp.status}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-zinc-200" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{rfp.client}</span>
                    </div>

                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-3 group-hover:text-indigo-600 transition-colors">
                      {rfp.title}
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 max-w-2xl">
                      {rfp.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                      <div>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                          <Timer className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                          Deadline
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-zinc-900 text-sm tracking-tight">{rfp.deadline}</span>
                          <span className={cn(
                            "text-[10px] font-bold mt-0.5",
                            rfp.daysLeft <= 7 ? "text-rose-500" : "text-emerald-500"
                          )}>
                            {rfp.daysLeft} days remaining
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                          <ShieldCheck className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                          Complexity
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className={cn(
                                "w-1 h-3 rounded-full",
                                i === 1 && "bg-indigo-500",
                                i === 2 && (rfp.complexityType === 'medium' || rfp.complexityType === 'high' || rfp.complexityType === 'critical') ? "bg-indigo-500" : "bg-zinc-100",
                                i === 3 && (rfp.complexityType === 'high' || rfp.complexityType === 'critical') ? "bg-indigo-500" : "bg-zinc-100"
                              )} />
                            ))}
                          </div>
                          <span className="font-black text-zinc-900 text-sm tracking-tight">{rfp.complexity}</span>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block">
                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                          <User className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                          Assigned by
                        </div>
                        <div className="font-black text-zinc-900 text-sm tracking-tight">{rfp.assignedBy}</div>
                      </div>

                      <div className="hidden sm:block">
                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                          <Award className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                          Priority
                        </div>
                        <div className="font-black text-zinc-900 text-sm tracking-tight">Level {rfp.complexityType === 'critical' ? '1' : '2'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Action */}
                  <div className="xl:w-48 bg-zinc-50/50 xl:border-l border-zinc-100 flex items-center justify-center p-6 xl:p-0">
                    <button 
                      onClick={() => router.push('/dashboard/architect/workspace')}
                      className="w-full xl:h-full flex xl:flex-col items-center justify-center gap-3 xl:gap-4 text-zinc-400 hover:text-indigo-600 hover:bg-white transition-all group/btn py-4 xl:py-0"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover/btn:border-indigo-200 group-hover/btn:shadow-indigo-100 group-hover/btn:scale-110 transition-all">
                        <Folder className="w-6 h-6 group-hover/btn:text-indigo-600 transition-colors" />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] group-hover/btn:text-indigo-600 transition-colors">Workspace</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default function ArchitectDashboard() {
  return (
    <Suspense fallback={<div className="font-black text-zinc-400 p-20 text-center uppercase tracking-widest animate-pulse">Initializing Dashboard...</div>}>
      <AssignedRfpsContent />
    </Suspense>
  )
}

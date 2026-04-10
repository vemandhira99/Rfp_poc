'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, User, Folder } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AssignedRfpsContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')?.toLowerCase() || ''

  const allRfps = [
    {
      title: "Enterprise Cloud Migration Platform",
      client: "Global Tech Corp",
      deadline: "2026-04-25",
      complexity: "High",
      complexityColor: "bg-red-50 text-red-600",
      status: "In Progress",
      statusColor: "bg-blue-50 text-blue-600",
      assignedBy: "Jennifer Smith"
    },
    {
      title: "Healthcare Data Analytics Solution",
      client: "MediCare Systems",
      deadline: "2026-04-15",
      complexity: "Critical",
      complexityColor: "bg-red-100 text-red-700",
      status: "New",
      statusColor: "bg-emerald-50 text-emerald-600",
      assignedBy: "Michael Chen"
    },
    {
      title: "Retail CX Portal",
      client: "RetailMax",
      deadline: "2026-05-10",
      complexity: "Medium",
      complexityColor: "bg-orange-50 text-orange-600",
      status: "Review",
      statusColor: "bg-purple-50 text-purple-600",
      assignedBy: "Jennifer Smith"
    }
  ]

  const rfps = allRfps.filter(rfp => rfp.title.toLowerCase().includes(q) || rfp.client.toLowerCase().includes(q))

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Assigned RFPs</h1>
        <p className="text-zinc-500 text-base mt-2">RFPs assigned to you for technical response</p>
      </div>

      <div className="space-y-6 pt-2">
        {rfps.length === 0 ? (
          <p className="text-zinc-500 text-sm">No RFPs match your search "{q}".</p>
        ) : (
          rfps.map((rfp, idx) => (
            <Card key={idx} className="border border-zinc-200 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-xl font-bold text-zinc-900">{rfp.title}</h2>
                  <button className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg flex items-center font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
                    <Folder className="w-4 h-4 mr-2" />
                    Open Workspace
                  </button>
                </div>
                <p className="text-zinc-500 text-sm mb-8">{rfp.client}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center text-zinc-500 text-sm mb-1.5">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Deadline
                    </div>
                    <div className="font-semibold text-zinc-900 text-base">{rfp.deadline}</div>
                  </div>
                  
                  <div>
                    <div className="text-zinc-500 text-sm mb-1.5">Complexity</div>
                    <span className={`inline-flex items-center px-3 py-0.5 rounded text-sm font-medium ${rfp.complexityColor}`}>
                      {rfp.complexity}
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-zinc-500 text-sm mb-1.5">Status</div>
                    <span className={`inline-flex items-center px-3 py-0.5 rounded text-sm font-medium ${rfp.statusColor}`}>
                      {rfp.status}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-zinc-500 text-sm mb-1.5">
                      <User className="w-4 h-4 mr-1.5 focus:fill-none" />
                      Assigned by
                    </div>
                    <div className="font-semibold text-zinc-900 text-base">{rfp.assignedBy}</div>
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
    <Suspense fallback={<div>Loading assigned RFPs...</div>}>
      <AssignedRfpsContent />
    </Suspense>
  )
}

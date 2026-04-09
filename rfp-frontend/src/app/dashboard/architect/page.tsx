'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, Code2, Play } from 'lucide-react'

export default function ArchitectDashboard() {
  const stats = [
    { title: 'Technical Reviews', count: '12', icon: Code2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Compliance Issues', count: '4', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Approved Solutions', count: '28', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'In Progress', count: '7', icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Solution Architect Dashboard</h1>
        <p className="text-zinc-500 mt-1">Review technical compliance and solution diagrams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-zinc-900">{stat.count}</h3>
                    <p className="text-sm font-medium text-zinc-500 mt-1">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-8 text-center">
        <Code2 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-zinc-900">No active technical reviews</h3>
        <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
          You have cleared all pending requirements. New RFPs requiring technical breakdown will appear here.
        </p>
      </div>
    </div>
  )
}

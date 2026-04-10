'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  Search,
  ChevronRight,
  Filter,
  ArrowUpRight,
  FileText,
  DollarSign,
  Calendar
} from 'lucide-react'
import { MOCK_RFPS, RFPStatus } from '@/lib/mocks/rfpData'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function ApprovalsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<RFPStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = {
    approved: MOCK_RFPS.filter(r => r.status === 'approved').length,
    rejected: MOCK_RFPS.filter(r => r.status === 'rejected').length,
    onHold: MOCK_RFPS.filter(r => r.status === 'on-hold').length,
    total: MOCK_RFPS.length
  }

  const filteredRFPs = MOCK_RFPS.filter(rfp => {
    const matchesFilter = filter === 'all' || rfp.status === filter
    const matchesSearch = rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         rfp.client.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: RFPStatus) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100'
      case 'on-hold': return 'bg-amber-50 text-amber-700 border-amber-100'
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-100'
    }
  }

  const getStatusIcon = (status: RFPStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'on-hold': return <PauseCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Approvals & Rejections</h1>
          <p className="text-zinc-500 mt-1 font-medium">Review and manage the final status of all RFP submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Filter by title or client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 border-zinc-200 rounded-xl focus-visible:ring-zinc-900"
            />
          </div>
          <Button variant="outline" className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'all', label: 'Total RFPs', count: stats.total, icon: FileText, color: 'zinc' },
          { id: 'approved', label: 'Approved', count: stats.approved, icon: CheckCircle2, color: 'emerald' },
          { id: 'on-hold', label: 'On Hold', count: stats.onHold, icon: PauseCircle, color: 'amber' },
          { id: 'rejected', label: 'Rejected', count: stats.rejected, icon: XCircle, color: 'rose' }
        ].map((item) => (
          <Card 
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={cn(
              "cursor-pointer transition-all border-zinc-200 hover:shadow-md active:scale-[0.98]",
              filter === item.id ? `ring-2 ring-zinc-900 shadow-sm bg-zinc-50` : "bg-white"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{item.label}</p>
                  <h3 className="text-3xl font-black text-zinc-900">{item.count}</h3>
                </div>
                <div className={cn(
                  "p-2.5 rounded-xl",
                  item.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                  item.color === 'amber' ? "bg-amber-50 text-amber-600" :
                  item.color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-zinc-100 text-zinc-600"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-zinc-400 gap-1 uppercase tracking-tighter">
                <span>View all {item.label.toLowerCase()}</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RFP List Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            Recent Submissions
            <Badge variant="outline" className="rounded-full bg-white font-bold">{filteredRFPs.length}</Badge>
          </h3>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-zinc-500 hover:text-zinc-900">
            Export Data
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="px-6 py-4">RFP Details</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRFPs.length > 0 ? filteredRFPs.map((rfp) => (
                <tr key={rfp.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{rfp.title}</p>
                      <p className="text-xs text-zinc-500 font-medium">ID: {rfp.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-zinc-700">{rfp.client}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                      <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                      {rfp.value}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn("rounded-lg border-2 font-bold flex items-center gap-1.5 w-fit", getStatusColor(rfp.status))}>
                      {getStatusIcon(rfp.status)}
                      {rfp.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {rfp.deadline}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      onClick={() => router.push(`/dashboard/ceo/rfp/${rfp.id}`)}
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg font-bold hover:bg-zinc-900 hover:text-white transition-all border-zinc-200"
                    >
                      Review
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6 text-zinc-300" />
                      </div>
                      <p className="text-sm font-bold text-zinc-900">No RFPs found</p>
                      <p className="text-xs text-zinc-500">Try adjusting your filters or search query to find what you're looking for.</p>
                      <Button variant="outline" onClick={() => { setFilter('all'); setSearchQuery('') }} className="text-xs font-bold rounded-xl mt-4">
                        Clear all filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

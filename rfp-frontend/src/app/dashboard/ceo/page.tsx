'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Upload, TrendingUp, AlertCircle, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { MOCK_RFPS, DASHBOARD_STATS, RFPStatus, RFPRisk } from '@/lib/mocks/rfpData'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { UploadRfpModal } from '@/components/rfp/UploadRfpModal'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

function StatusBadge({ status }: { status: RFPStatus }) {
  const styles: Record<RFPStatus, string> = {
    'new': 'bg-blue-50 text-blue-700 border-blue-200',
    'in-progress': 'bg-purple-50 text-purple-700 border-purple-200',
    'pending-review': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'pending-approval': 'bg-orange-50 text-orange-700 border-orange-200',
    'approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'rejected': 'bg-red-50 text-red-700 border-red-200',
    'on-hold': 'bg-zinc-100 text-zinc-700 border-zinc-200',
    'queued_for_processing': 'bg-zinc-50 text-zinc-500 border-zinc-200 animate-pulse',
    'processing_summary': 'bg-blue-50 text-blue-500 border-blue-200 animate-pulse',
    'assigned_to_sa': 'bg-indigo-50 text-indigo-600 border-indigo-200',
    'in_drafting': 'bg-purple-50 text-purple-600 border-purple-200 animate-pulse',
    'under_review': 'bg-amber-50 text-amber-600 border-amber-200',
    'rate_limit_error': 'bg-rose-50 text-rose-600 border-rose-200',
    'error': 'bg-red-50 text-red-700 border-red-200',
  }

  const labels: Record<RFPStatus, string> = {
    'new': 'New',
    'in-progress': 'In Progress',
    'pending-review': 'Pending Review',
    'pending-approval': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'on-hold': 'On Hold',
    'queued_for_processing': 'Queued',
    'processing_summary': 'AI Analyzing...',
    'assigned_to_sa': 'SA Assigned',
    'in_drafting': 'AI Drafting...',
    'under_review': 'Under Review',
    'rate_limit_error': 'Quota Exceeded',
    'error': 'Failed',
  }

  return (
    <Badge variant="outline" className={`${styles[status]} font-medium`}>
      {labels[status]}
    </Badge>
  )
}

function AIProgressBar({ status }: { status: RFPStatus }) {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (status === 'queued_for_processing') setProgress(15)
    else if (status === 'processing_summary') {
      setProgress(30)
      const timer = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 1 : prev))
      }, 500)
      return () => clearInterval(timer)
    } else if (status === 'in_drafting') {
      setProgress(60)
      const timer = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + 0.5 : prev))
      }, 500)
      return () => clearInterval(timer)
    } else {
      setProgress(100)
    }
  }, [status])

  if (progress === 100 || !['queued_for_processing', 'processing_summary', 'in_drafting'].includes(status)) {
    return null
  }

  return (
    <div className="w-full max-w-[120px] mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-medium text-blue-600 animate-pulse">Processing...</span>
        <span className="text-[10px] font-medium text-blue-600">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function RiskBadge({ risk }: { risk: RFPRisk }) {
  const styles: Record<RFPRisk, string> = {
    'low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'medium': 'bg-orange-50 text-orange-700 border-orange-200',
    'high': 'bg-rose-50 text-rose-700 border-rose-200',
    'critical': 'bg-red-100 text-red-800 border-red-300 font-bold',
  }

  return (
    <Badge variant="outline" className={`${styles[risk]} capitalize`}>
      {risk}
    </Badge>
  )
}

export default function CEODashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  
  const [rfps, setRfps] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    activeRFPs: 0,
    pendingReview: 0,
    totalValue: 0,
    dueThisWeek: 0,
    approvedThisQuarter: 0,
    rejectedThisQuarter: 0,
    awaitingClarification: 0
  })
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      const { fetchApi } = await import('@/lib/api')
      const [statsData, rfpsData] = await Promise.all([
        fetchApi('/rfps/dashboard-summary'),
        fetchApi('/rfps/')
      ])
      
      setStats({
        activeRFPs: statsData.total,
        pendingReview: statsData.under_review,
        totalValue: statsData.total_value || 0,
        dueThisWeek: 0,
        approvedThisQuarter: statsData.approved,
        rejectedThisQuarter: statsData.rejected,
        awaitingClarification: 0
      })

      // Map backend rfps
      const rfpsMapped = rfpsData.map((r: any) => {
        let summary: any = null
        if (r.summary_json) {
          try { summary = JSON.parse(r.summary_json) } catch(e) {}
        }
        
        return {
          ...r,
          title: r.title || 'Untitled',
          client: summary?.client_name || r.client_name || 'Unknown',
          risk: summary?.risks?.length ? 'high' : 'medium',
          status: r.current_status,
          value: summary?.value || '₹0',
          deadline: summary?.deadline || 'TBD',
          effort: summary?.effort_estimation || 'TBD'
        }
      })
      setRfps(rfpsMapped)
      
    } catch(err) {
      console.error("Failed to load backend data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredRFPs = rfps.filter(
    (rfp) => 
      rfp.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      rfp.client?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const statsArr = [
    { label: 'Active RFPs', value: stats.activeRFPs, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Review', value: stats.pendingReview, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Pipeline', value: formatCurrency(stats.totalValue), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Approved', value: stats.approvedThisQuarter, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: stats.rejectedThisQuarter, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">RFP Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage and review all active RFPs</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New RFP
        </Button>
      </div>

      <UploadRfpModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArr.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-zinc-900">{stat.value}</h3>
                    <p className="text-sm font-medium text-zinc-500 mt-1">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent RFPs</h2>
          <div className="flex items-center gap-3">
            <select className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400">
              <option>All Statuses</option>
              <option>Pending Approval</option>
              <option>In Progress</option>
            </select>
            <select className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400">
              <option>All Risk Levels</option>
              <option>High / Critical</option>
              <option>Medium / Low</option>
            </select>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="border-b border-zinc-200">
              <TableHead className="font-semibold text-zinc-900 h-11">Title</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-11">Client</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-11">Deadline</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-11 font-medium hidden md:table-cell">Value</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-11">Status</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-11">Risk</TableHead>
              <TableHead className="text-right font-semibold text-zinc-900 h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRFPs.map((rfp) => (
              <TableRow key={rfp.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                <TableCell className="font-medium text-zinc-900 py-4">
                  {rfp.title}
                </TableCell>
                <TableCell className="text-zinc-600 py-4">{rfp.client}</TableCell>
                <TableCell className="py-4">
                  <div className="text-zinc-900">{rfp.deadline}</div>
                  {rfp.effort !== 'TBD' && (
                    <div className="text-xs text-blue-600 font-medium">Est. effort: {rfp.effort}</div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-zinc-900 py-4 hidden md:table-cell">{rfp.value}</TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <StatusBadge status={rfp.status} />
                    <AIProgressBar status={rfp.status} />
                    {rfp.status === 'error' && (
                      <span className="text-[10px] text-red-500 mt-1 font-medium italic">Internal AI Error. Check Logs.</span>
                    )}
                    {rfp.status === 'rate_limit_error' && (
                      <span className="text-[10px] text-orange-600 mt-1 font-semibold animate-pulse italic">Gemini Quota Reached. Waiting 60s...</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <RiskBadge risk={rfp.risk} />
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg font-bold hover:bg-zinc-900 hover:text-white transition-all border-zinc-200"
                    onClick={() => router.push(`/dashboard/ceo/rfp/${rfp.id}`)}
                  >
                    Analyze
                    <ArrowUpRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRFPs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                  No RFPs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

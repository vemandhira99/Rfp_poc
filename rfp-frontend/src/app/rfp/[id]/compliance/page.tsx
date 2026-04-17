'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Clock, Sparkles, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

function StatusCell({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === 'compliant') {
    return (
      <div className="flex items-center gap-2 text-emerald-700 font-medium">
        <CheckCircle2 className="w-5 h-5" />
        <span>Compliant</span>
      </div>
    )
  }
  if (s === 'partial') {
    return (
      <div className="flex items-center gap-2 text-orange-600 font-medium">
        <AlertTriangle className="w-5 h-5" />
        <span>Partial</span>
      </div>
    )
  }
  if (s === 'non-compliant' || s === 'non_compliant' || s === 'non compliant') {
    return (
      <div className="flex items-center gap-2 text-rose-600 font-medium">
        <XCircle className="w-5 h-5" />
        <span>Not compliant</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 text-zinc-500 font-medium">
      <Clock className="w-5 h-5" />
      <span>Pending</span>
    </div>
  )
}

export default function ComplianceMatrixPage() {
  const params = useParams()
  const id = params.id as string
  
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const fetchItems = async () => {
    try {
      const { fetchApi } = await import('@/lib/api')
      const data = await fetchApi(`/rfps/${id}/compliance`)
      setItems(data || [])
    } catch (e) {
      console.error("Failed to fetch compliance", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchItems()
  }, [id])

  const handleGenerate = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const { fetchApi } = await import('@/lib/api')
      await fetchApi(`/ai/rfp/${id}/compliance-generate`, { method: 'POST' })
      await fetchItems()
    } catch (e) {
      alert("Failed to generate AI Compliance Matrix")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">Compliance Matrix</h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">Review requirement adherence and AI-suggested response strategies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 rounded-xl shadow-lg shadow-indigo-100 h-11 px-5"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Extracting Requirements...' : 'Generate AI Matrix'}
          </Button>
          <Button variant="outline" className="text-zinc-700 bg-white shadow-sm border-zinc-200 rounded-xl font-bold h-11 px-5">
            Export Matrix
          </Button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-200">
              <TableHead className="font-extrabold uppercase tracking-widest text-[10px] text-zinc-400 h-12 w-[35%] pl-6">Requirement</TableHead>
              <TableHead className="font-extrabold uppercase tracking-widest text-[10px] text-zinc-400 h-12 w-[15%]">Status</TableHead>
              <TableHead className="font-extrabold uppercase tracking-widest text-[10px] text-zinc-400 h-12 w-[30%]">Response Strategy</TableHead>
              <TableHead className="font-extrabold uppercase tracking-widest text-[10px] text-zinc-400 h-12 w-[20%] pr-6 text-right">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell className="py-6 pl-6"><div className="h-4 bg-zinc-100 rounded w-3/4" /></TableCell>
                  <TableCell><div className="h-4 bg-zinc-100 rounded w-1/2" /></TableCell>
                  <TableCell><div className="h-4 bg-zinc-100 rounded w-full" /></TableCell>
                  <TableCell className="pr-6"><div className="h-4 bg-zinc-100 rounded w-1/2 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id} className="border-b border-zinc-50 last:border-none hover:bg-zinc-50/30 transition-colors">
                  <TableCell className="py-5 pl-6 align-top">
                    <span className="font-bold text-zinc-900 block text-sm leading-snug">{item.requirement_text}</span>
                    <span className="text-[10px] font-black uppercase text-zinc-400 mt-1 block tracking-wider">{item.category}</span>
                  </TableCell>
                  <TableCell className="py-5 align-top">
                    <StatusCell status={item.status} />
                  </TableCell>
                  <TableCell className="py-5 align-top">
                    <p className="text-sm text-zinc-600 leading-relaxed font-medium">{item.response_strategy || 'No strategy defined'}</p>
                  </TableCell>
                  <TableCell className="py-5 pr-6 align-top text-right">
                    <p className="text-xs text-zinc-400 font-medium italic">{item.notes || '-'}</p>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-zinc-500 font-bold">No compliance items yet.</p>
                    <p className="text-zinc-400 text-xs font-medium">Click "Generate AI Matrix" to extract requirements from the RFP document.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

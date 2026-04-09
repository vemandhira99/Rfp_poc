'use client'

import { useParams } from 'next/navigation'
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { MOCK_RFPS, ComplianceItem } from '@/lib/mocks/rfpData'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

function StatusCell({ status }: { status: ComplianceItem['status'] }) {
  if (status === 'compliant') {
    return (
      <div className="flex items-center gap-2 text-emerald-700 font-medium">
        <CheckCircle2 className="w-5 h-5" />
        <span>Compliant</span>
      </div>
    )
  }
  if (status === 'partial') {
    return (
      <div className="flex items-center gap-2 text-orange-600 font-medium">
        <AlertTriangle className="w-5 h-5" />
        <span>Partial</span>
      </div>
    )
  }
  if (status === 'non-compliant') {
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
  const rfp = MOCK_RFPS.find(r => r.id === id) || MOCK_RFPS[0]

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Compliance Matrix</h2>
          <p className="text-sm text-zinc-500 mt-1">Review requirement adherence and responses</p>
        </div>
        <Button variant="outline" className="text-zinc-700 bg-white shadow-sm border-zinc-300">
          Export Matrix
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="border-b border-zinc-200">
              <TableHead className="font-semibold text-zinc-900 h-12 w-[30%]">Requirement</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-12 w-[15%]">Status</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-12 w-[35%]">Response Strategy</TableHead>
              <TableHead className="font-semibold text-zinc-900 h-12 w-[20%]">Notes / Blockers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfp.complianceItems.map((item) => (
              <TableRow key={item.id} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50/50">
                <TableCell className="py-4 align-top">
                  <span className="font-medium text-zinc-900 block">{item.requirement}</span>
                </TableCell>
                <TableCell className="py-4 align-top">
                  <StatusCell status={item.status} />
                </TableCell>
                <TableCell className="py-4 align-top">
                  <p className="text-sm text-zinc-700 leading-relaxed">{item.response}</p>
                </TableCell>
                <TableCell className="py-4 align-top">
                  <p className="text-sm text-zinc-500 italic">{item.notes || '-'}</p>
                </TableCell>
              </TableRow>
            ))}
            {(!rfp.complianceItems || rfp.complianceItems.length === 0) && (
             <TableRow>
               <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                 No compliance items track yet.
               </TableCell>
             </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

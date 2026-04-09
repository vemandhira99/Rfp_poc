'use client'

import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, MessageSquare, AlertTriangle, HelpCircle, DollarSign, Activity } from 'lucide-react'
import { MOCK_RFPS } from '@/lib/mocks/rfpData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const rfp = MOCK_RFPS.find(r => r.id === id) || MOCK_RFPS[0]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Final Leadership Review</h2>
          <p className="text-sm text-zinc-500 mt-1">Review the complete proposal and approve for submission.</p>
        </div>
      </div>

      {/* Review Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-zinc-200">
          <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-3">
            <CardTitle className="text-sm text-zinc-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Budget & Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Contract Value</p>
              <p className="text-2xl font-bold text-zinc-900">{rfp.value}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Estimated Cost / Effort</p>
              <p className="text-base font-medium text-zinc-700">
                {rfp.effortEstimation.reduce((acc, e) => acc + e.weeks, 0)} weeks of dedicated delivery
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Margin Profile</p>
              <p className="text-emerald-600 font-bold">Healthy (Est. 45% Gross Margin)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/10">
          <CardHeader className="bg-rose-50/50 border-b border-rose-100 pb-3">
            <CardTitle className="text-sm text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Residual Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {rfp.risks.filter(r => r.severity === 'critical' || r.severity === 'high').map(risk => (
              <div key={risk.id} className="flex gap-3 items-start">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                <p className="text-sm text-zinc-800"><strong className="font-semibold text-zinc-900">{risk.title}:</strong> {risk.description}</p>
              </div>
            ))}
            {rfp.risks.filter(r => r.severity === 'critical' || r.severity === 'high').length === 0 && (
              <p className="text-sm text-zinc-600">No critical or high residual risks identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="border-b border-zinc-100 pb-4">
          <CardTitle className="text-lg text-zinc-900 flex items-center gap-2">
             <Activity className="w-5 h-5 text-blue-600" /> AI Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-blue-50/30">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                  <span className="text-blue-700 font-bold">AI</span>
               </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900 mb-2">Proceed with Approval</p>
              <p className="text-zinc-700 leading-relaxed text-sm">
                Based on historical win rates with <strong className="text-black">{rfp.clientType}</strong>, this proposal is highly aligned with our strategic capabilities. All mandatory compliance items have been addressed or have acceptable mitigation plans. The estimated gross margin of 45% exceeds our baseline target.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 bg-zinc-50 p-6 rounded-xl border border-zinc-200">
        <h3 className="text-sm font-semibold text-zinc-900">Leadership Decision</h3>
        <Textarea 
          placeholder="Add final approval notes or requested changes..." 
          className="min-h-[100px] border-zinc-300 focus-visible:ring-black"
        />
        <div className="flex gap-4 pt-2">
          <Button variant="outline" className="flex-1 bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100">
            <MessageSquare className="w-4 h-4 mr-2" /> Request Changes
          </Button>
          <Button className="flex-1 bg-black hover:bg-zinc-800 text-white shadow-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve for Submission
          </Button>
        </div>
      </div>
      
    </div>
  )
}

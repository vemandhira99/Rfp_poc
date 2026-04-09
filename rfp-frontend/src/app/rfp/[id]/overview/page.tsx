'use client'

import { useParams, useRouter } from 'next/navigation'
import { Check, PauseCircle, XCircle, ArrowLeft, ShieldAlert, Cpu, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react'
import { MOCK_RFPS } from '@/lib/mocks/rfpData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function RFPOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const rfp = MOCK_RFPS.find(r => r.id === id) || MOCK_RFPS[0]

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'medium': return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'high': return 'text-rose-700 bg-rose-50 border-rose-200'
      case 'critical': return 'text-red-800 bg-red-100 border-red-300 font-bold'
      default: return 'text-zinc-700 bg-zinc-50 border-zinc-200'
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/ceo')} className="text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{rfp.title}</h1>
          <p className="text-zinc-500 mt-1">{rfp.client} • {rfp.clientType}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-zinc-300 text-zinc-700 hover:bg-zinc-100">
            <PauseCircle className="w-4 h-4 mr-2" /> Hold
          </Button>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
            <XCircle className="w-4 h-4 mr-2" /> Reject
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Check className="w-4 h-4 mr-2" /> Proceed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Executive & AI Intelligence */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Executive Summary */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
              <CardTitle className="text-lg text-zinc-900 flex items-center gap-2">
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Value</p>
                  <p className="text-xl font-bold text-zinc-900">{rfp.value}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-xl font-bold text-zinc-900">{rfp.deadline}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Complexity</p>
                  <Badge variant="outline" className={`capitalize ${getRiskColor(rfp.complexity)}`}>{rfp.complexity}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Overall Risk</p>
                  <Badge variant="outline" className={`capitalize ${getRiskColor(rfp.risk)}`}>{rfp.risk}</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-sm text-zinc-700 leading-relaxed"><strong className="text-zinc-900">Project:</strong> {rfp.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-700 leading-relaxed"><strong className="text-zinc-900">Strategic Fit:</strong> {rfp.strategicFit}</p>
              </div>
            </CardContent>
          </Card>

          {/* System Intelligence View */}
          <Card className="border-blue-200 shadow-sm bg-blue-50/10">
            <CardHeader className="border-b border-blue-100 bg-blue-50/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" /> System Intelligence Analysis
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">AI Generated</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600"/> Extracted Scope
                  </h3>
                  <ul className="space-y-2">
                    {rfp.requirements.map(req => (
                      <li key={req.id} className="text-sm text-zinc-600 pl-6 relative">
                        <span className="absolute left-1.5 top-1.5 w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                        <strong className="text-zinc-800">{req.title}:</strong> {req.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600"/> Commercial Terms
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-zinc-600 pl-6 relative">
                      <span className="absolute left-1.5 top-1.5 w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                      Contract Length: <strong className="text-zinc-800">{rfp.contractLength}</strong>
                    </li>
                    <li className="text-sm text-zinc-600 pl-6 relative">
                      <span className="absolute left-1.5 top-1.5 w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                      Payment Terms: <strong className="text-zinc-800">{rfp.paymentTerms}</strong>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600"/> Mandatory Clauses & SLAs
                  </h3>
                  <ul className="space-y-2">
                    {rfp.complianceItems.slice(0,2).map(c => (
                      <li key={c.id} className="text-sm text-zinc-600 pl-6 relative">
                        <span className="absolute left-1.5 top-1.5 w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                        {c.requirement}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Risks & Effort */}
        <div className="space-y-8">
          
          {/* Risk Section */}
          <Card className="border-rose-200 shadow-sm bg-rose-50/10">
            <CardHeader className="border-b border-rose-100 bg-rose-50/30 pb-4">
              <CardTitle className="text-lg text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Key Risks Identified
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-rose-100">
                {rfp.risks.map(risk => (
                  <div key={risk.id} className="p-4 flex gap-4">
                    <div className="mt-0.5">
                      <Badge variant="outline" className={`capitalize ${getRiskColor(risk.severity)}`}>{risk.severity}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">{risk.title}</h4>
                      <p className="text-sm text-zinc-600 mt-1">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Effort & Complexity */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
              <CardTitle className="text-lg text-zinc-900">Effort Estimation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100">
                {rfp.effortEstimation.map(est => (
                  <div key={est.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-900">{est.phase}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{est.team}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-zinc-900">{est.weeks}</span>
                      <span className="text-xs text-zinc-500 ml-1">weeks</span>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-zinc-50 flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-900">Total Duration</span>
                  <span className="text-sm font-bold text-zinc-900">
                    {rfp.effortEstimation.reduce((acc, est) => acc + est.weeks, 0)} weeks
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Send,
  UserPlus,
  Ban,
  Pause
} from 'lucide-react'
import { MOCK_RFPS, RFP } from '@/lib/mocks/rfpData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function RfpReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [rfp, setRfp] = useState<RFP | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your RFP AI Assistant. I have analyzed this document and can help you with specific questions about technical requirements, compliance, or strategic fit. How can I assist you today?' }
  ])

  useEffect(() => {
    const found = MOCK_RFPS.find(r => r.id === params.id)
    if (found) {
      setRfp(found)
    }
  }, [params.id])

  if (!rfp) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <p className="text-zinc-500 font-medium">RFP not found or loading...</p>
      <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
    </div>
  )

  const handleSendMessage = (e?: React.FormEvent, text?: string) => {
    e?.preventDefault()
    const msg = text || chatInput
    if (!msg.trim()) return

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatInput('')

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Based on the RFP document, the answer involves ${msg.includes('technical') ? 'modernizing the cloud stack with a focus on multitenancy and high availability' : 'a strategic approach to compliance that covers both SOC2 and HIPAA standards'}.` 
      }])
    }, 1000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header / Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">{rfp.title}</h1>
          <p className="text-zinc-500 font-medium flex items-center gap-2">
            Executive Review & AI Analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-5 rounded-xl border-zinc-200 font-bold gap-2 text-zinc-600">
            <Pause className="w-4 h-4" />
            Hold
          </Button>
          <Button variant="outline" className="h-11 px-5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold gap-2">
            <Ban className="w-4 h-4" />
            Reject
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100">
            <UserPlus className="w-4 h-4" />
            Assign Solution Architect
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Client</p>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 leading-tight">{rfp.client}</h3>
                    <p className="text-sm text-zinc-500 font-medium mt-1 uppercase tracking-tight">{rfp.clientType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Timeline</p>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 leading-tight">Due: {rfp.deadline}</h3>
                    <p className="text-sm text-amber-600 font-bold mt-1 uppercase tracking-tight flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {rfp.daysRemaining} days remaining
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Financial Overview
                  </h3>
                </div>
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-x-16 gap-y-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Estimated Value</p>
                      <p className="text-3xl font-black text-zinc-900 tracking-tight">
                        {rfp.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Contract Length</p>
                      <p className="text-2xl font-black text-zinc-900 tracking-tight">{rfp.contractLength}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Terms</p>
                      <p className="text-2xl font-black text-zinc-900 tracking-tight">{rfp.paymentTerms}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="font-bold text-zinc-900">Effort Estimation</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      { label: 'Discovery & Planning', value: '2 weeks' },
                      { label: 'Technical Response', value: '1 week' },
                      { label: 'Executive Review', value: '3 days' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-2 hover:bg-zinc-50 rounded-lg transition-colors overflow-hidden group">
                        <span className="text-zinc-500 font-semibold text-sm group-hover:text-zinc-900 transition-colors">{item.label}</span>
                        <div className="flex-1 mx-4 border-b border-dotted border-zinc-200" />
                        <span className="text-zinc-900 font-bold text-sm tracking-tight">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-4 mt-2 border-t border-zinc-100 flex items-center justify-between px-2">
                      <span className="text-zinc-900 font-black text-sm uppercase tracking-tighter">Total Effort</span>
                      <span className="text-blue-600 font-black text-sm tracking-tight bg-blue-50 px-3 py-1 rounded-full border border-blue-100">~24 days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="font-bold text-zinc-900">Scope Summary</h3>
                </div>
                <div className="p-8">
                  <p className="text-zinc-600 leading-relaxed font-medium">
                    {rfp.client} seeks a comprehensive platform to transition their on-premise infrastructure to AWS. 
                    The solution must support 200+ applications, ensure zero downtime during migration, and provide automated testing and rollback capabilities.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-rose-100 shadow-sm overflow-hidden bg-rose-50/10">
                <CardContent className="p-0">
                  <div className="p-5 border-b border-rose-100 bg-rose-50/20">
                    <h3 className="font-bold text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Identified Risks
                    </h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {[
                        'Tight 17-day deadline for comprehensive response',
                        'Complex compliance requirements (SOC2, HIPAA)',
                        'Requires specialized cloud architecture expertise'
                      ].map((risk, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-sm overflow-hidden bg-blue-50/5">
                <CardContent className="p-0">
                  <div className="p-5 border-b border-blue-100 bg-blue-50/10">
                    <h3 className="font-bold text-blue-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Recommendation
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-zinc-900 font-black">
                      Proceed with high priority. <span className="text-zinc-500 font-medium">Strong strategic fit with our cloud practice.</span>
                    </p>
                    <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                      Recommend assigning Sarah Chen (Senior SA) given her AWS expertise and previous Fortune 500 experience. Budget 120 hours for response development.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-zinc-900 rounded-full" />
                  Win Probability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Technical Fit', value: 85, color: 'bg-emerald-500' },
                    { label: 'Past Relationship', value: 60, color: 'bg-amber-500' },
                    { label: 'Pricing Competitiveness', value: 75, color: 'bg-emerald-500' }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                        <span>{stat.label}</span>
                        <span className="text-zinc-900 text-sm font-black">{stat.value}%</span>
                      </div>
                      <Progress value={stat.value} className="h-2 rounded-full bg-zinc-100" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Aggregate Confidence</span>
                    <span className="text-sm font-bold text-zinc-500">Based on historical win/loss patterns</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-px bg-zinc-100" />
                    <span className="text-4xl font-black text-emerald-600 tracking-tight">73%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar / AI Assistant - ChatGPT Redesign */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-2xl overflow-hidden sticky top-24 bg-[#f9f9f9] border border-zinc-200/50 rounded-3xl">
            <CardHeader className="p-6 pb-4 bg-white border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-200 group transition-transform hover:scale-105 active:scale-95">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black text-zinc-900 tracking-tight">AI Advisor</CardTitle>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Analysis</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-50">
                  <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[450px] overflow-y-auto p-6 space-y-6 bg-[#f9f9f9] scrollbar-thin scrollbar-thumb-zinc-200">
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col space-y-2",
                    msg.role === 'ai' ? "items-start" : "items-end"
                  )}>
                    <div className={cn(
                      "max-w-[90%] px-5 py-4 text-sm font-medium leading-relaxed transition-all duration-300",
                      msg.role === 'ai' 
                        ? "bg-white border border-zinc-100 text-zinc-700 rounded-2xl rounded-tl-none shadow-[2px_2px_10px_rgba(0,0,0,0.02)]" 
                        : "bg-zinc-900 text-white rounded-2xl rounded-tr-none shadow-xl shadow-zinc-200"
                    )}>
                      {msg.text}
                    </div>
                    {msg.role === 'ai' && i === 0 && (
                      <div className="flex items-center gap-1 ml-1">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900">Copy</Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900">Good</Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900">Bad</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-5 bg-white border-t border-zinc-100">
                <div className="relative group">
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Message AI Advisor..."
                    className="w-full min-h-[90px] p-4 text-sm font-medium border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all resize-none bg-zinc-50 placeholder:text-zinc-400 shadow-inner"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-300 mr-1 hidden group-hover:block">Enter ↵</span>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="h-10 w-10 p-0 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-zinc-200"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-zinc-50 border-t border-zinc-100/50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Suggested Inquiries</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Key technical requirements?",
                    "Compliance summary",
                    "Mandatory certifications?"
                  ].map((prompt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSendMessage(undefined, prompt)}
                      className="px-3 py-2 text-[11px] font-bold text-zinc-500 bg-white border border-zinc-200 rounded-xl hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center group shadow-sm active:scale-95"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

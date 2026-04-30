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
  Pause,
  CheckCircle2
} from 'lucide-react'
import { MOCK_RFPS, RFP } from '@/lib/mocks/rfpData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function RfpReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [rfp, setRfp] = useState<any>(null)
  const [sections, setSections] = useState<{section_name: string, section_text: string}[]>([])
  const [aiSummary, setAiSummary] = useState<any>(null)
  
  // Architect Assignment State
  const [architects, setArchitects] = useState<any[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedArchitect, setSelectedArchitect] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  // Decision State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false)
  const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | 'on_hold' | 'proceed' | null>(null)
  const [decisionReason, setDecisionReason] = useState('')
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false)

  const [chatInput, setChatInput] = useState('')
  const [knowledgeMode, setKnowledgeMode] = useState('Hybrid') // 'RFP-Only' | 'Global' | 'Hybrid'
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI Advisor. Choose your preferred knowledge mode above and ask me anything about this RFP.' }
  ])

  useEffect(() => {
    async function loadData() {
      try {
        const { fetchApi } = await import('@/lib/api')
        // Using real DB ID from the URL path
        const rfpData = await fetchApi(`/rfps/${params.id}`)
        
        let fetchedSections = []
        try {
           fetchedSections = await fetchApi(`/uploads/rfp/${params.id}/sections`)
           setSections(fetchedSections || [])
        } catch(e) {
           console.log("Failed to load sections", e)
        }
        let sumData = null
        try {
           sumData = await fetchApi(`/rfps/${params.id}/summary`)
           if (!sumData.error) {
              setAiSummary(sumData)
           }
        } catch(e) {
           console.log("No AI summary yet")
        }
        
        // Map backend model to the rich frontend UI model
        setRfp({
          id: rfpData.id.toString(),
          title: rfpData.title || 'Untitled RFP',
          client: sumData?.client_name || rfpData.client_name || 'Unknown Client',
          clientType: 'Enterprise', 
          deadline: sumData?.deadline || 'TBD',
          daysRemaining: 14,
          value: sumData?.value || 'TBD',
          status: rfpData.current_status || 'pending_review',
          risk: 'Medium',
          contractLength: sumData?.contract_length || 'TBD',
          paymentTerms: sumData?.payment_terms || 'TBD',
          assignmentStatus: 'unassigned'
        } as any)
        // Fetch Architects
        try {
            const archData = await fetchApi('/auth/users/architects')
            setArchitects(archData || [])
        } catch(e) {
            console.log("Failed to load architects", e)
        }

      } catch (e) {
        console.error("Failed to load RFP", e)
      }
    }
    
    if (params.id) {
      loadData()
    }
  }, [params.id])

  if (!rfp) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <p className="text-zinc-500 font-medium animate-pulse">Loading RFP Details...</p>
    </div>
  )

  const handleSendMessage = async (e?: React.FormEvent, text?: string) => {
    e?.preventDefault()
    const msg = text || chatInput
    if (!msg.trim() || isChatLoading) return

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatInput('')
    setIsChatLoading(true)

    try {
        const { API_BASE_URL } = await import('@/lib/api')
        const token = localStorage.getItem('rfp_token')
        
        const response = await fetch(`${API_BASE_URL}/rfps/${params.id}/chat-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                message: msg,
                knowledge_mode: knowledgeMode,
                history: messages.slice(-10)
            })
        })

        if (!response.ok) throw new Error('Failed to connect')
        
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader')

        // Add an empty AI message to start streaming into
        setMessages(prev => [...prev, { role: 'ai', text: '' }])
        
        let accumulatedText = ''
        const decoder = new TextDecoder()
        
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            accumulatedText += chunk
            
            // Update the LAST message (the one we just added)
            setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = { 
                    role: 'ai', 
                    text: accumulatedText 
                }
                return newMessages
            })
        }
    } catch(e) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to the AI Advisor. Please try again.' }])
    } finally {
        setIsChatLoading(false)
    }
  }
  const isDecided = rfp?.status === 'approved' || rfp?.status === 'rejected' || rfp?.status === 'on_hold' || rfp?.status === 'assigned_to_sa'

  const handleDecision = async () => {
    if (!pendingDecision || isSubmittingDecision) return
    setIsSubmittingDecision(true)
    try {
      const { fetchApi } = await import('@/lib/api')
      await fetchApi(`/rfps/${params.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ 
          decision: pendingDecision, 
          reason: decisionReason 
        })
      })
      
      // Update local state
      setRfp((prev: any) => ({ ...prev, status: pendingDecision }))
      setIsDecisionModalOpen(false)
      setPendingDecision(null)
      setDecisionReason('')
      
      // If approved or proceed, maybe we want to trigger something else?
      // The backend already updates the status.
    } catch (e) {
      console.error("Failed to submit decision", e)
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  const handleAssignArchitect = async () => {
    if (!selectedArchitect || isAssigning) return
    setIsAssigning(true)
    try {
      const { fetchApi } = await import('@/lib/api')
      await fetchApi(`/rfps/${params.id}/assign-architect`, {
        method: 'POST',
        body: JSON.stringify({ architect_id: parseInt(selectedArchitect), notes: '' })
      })
      setIsAssignModalOpen(false)
      // Show visually it is assigned
      setRfp((prev: any) => ({ ...prev, status: 'assigned_to_sa' }))
    } catch (e) {
      console.error("Failed to assign architect", e)
    } finally {
      setIsAssigning(false)
    }
  }

  const openDecisionModal = (decision: 'approved' | 'rejected' | 'on_hold' | 'proceed') => {
    setPendingDecision(decision)
    setIsDecisionModalOpen(true)
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
          {isDecided && (
            <Badge className="h-11 px-4 rounded-xl bg-zinc-900 text-white font-bold animate-in slide-in-from-right-4">
              Status Locked: {rfp.status.replace(/[-_]/g, ' ').toUpperCase()}
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => openDecisionModal('on_hold')}
            disabled={isDecided}
            className={cn(
              "h-11 px-5 rounded-xl border-zinc-200 font-bold gap-2 text-zinc-600 hover:bg-zinc-50",
              isDecided && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            <Pause className="w-4 h-4" />
            Hold
          </Button>
          <Button 
            variant="outline" 
            onClick={() => openDecisionModal('rejected')}
            disabled={isDecided}
            className={cn(
              "h-11 px-5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold gap-2",
              isDecided && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            <Ban className="w-4 h-4" />
            Reject
          </Button>
          <Button 
            onClick={() => openDecisionModal('approved')}
            disabled={isDecided}
            className={cn(
              "h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-100",
              isDecided && "opacity-50 grayscale cursor-not-allowed shadow-none"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve RFP
          </Button>
          <div className="w-px h-8 bg-zinc-200 mx-1" />
          <Button 
            onClick={() => setIsAssignModalOpen(true)}
            disabled={rfp.status === 'assigned_to_sa' || rfp.status === 'rejected' || rfp.status === 'on_hold'}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100"
          >
            <UserPlus className="w-4 h-4" />
            {rfp.status === 'assigned_to_sa' ? 'Assigned' : 'Assign Architect'}
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
                    <div className="flex items-center justify-between py-1 px-2 hover:bg-zinc-50 rounded-lg transition-colors overflow-hidden group">
                      <span className="text-zinc-500 font-semibold text-sm group-hover:text-zinc-900 transition-colors">Estimated Total Effort</span>
                      <div className="flex-1 mx-4 border-b border-dotted border-zinc-200" />
                      <span className="text-zinc-900 font-bold text-sm tracking-tight">{aiSummary?.effort_estimation || 'TBD'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="font-bold text-zinc-900">Extracted AI Summary</h3>
                </div>
                <div className="p-8">
                  <p className="text-zinc-600 leading-relaxed font-medium">
                    {aiSummary?.summary?.executive_summary || "No executive summary generated yet."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="border-rose-100 shadow-sm overflow-hidden bg-rose-50/10">
                <CardContent className="p-0">
                  <div className="p-5 border-b border-rose-100 bg-rose-50/20">
                    <h3 className="font-bold text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Pending Risk Assessment
                    </h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {aiSummary?.summary?.risks && aiSummary.summary.risks.length > 0 ? (
                        aiSummary.summary.risks.map((risk: any, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                            <div className={cn(
                              "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 shadow-lg",
                              risk.severity === 'high' ? "bg-rose-500 shadow-rose-200" : "bg-zinc-400"
                            )} />
                            <span><strong className="text-zinc-900">{risk.risk}</strong> ({risk.severity})</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-zinc-400 italic font-medium">No physical risks identified by AI yet.</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-sm overflow-hidden bg-blue-50/5">
                <CardContent className="p-0">
                  <div className="p-5 border-b border-blue-100 bg-blue-50/10">
                    <h3 className="font-bold text-blue-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Next Steps
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-zinc-900 font-black">
                      AI Recommendation: <span className="text-indigo-600 uppercase tracking-tight">{aiSummary?.summary?.recommended_action || "Pending"}</span>
                    </p>
                    <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                      {aiSummary?.summary?.next_steps || "Recommend assigning a Solution Architect to verify technical parameters and draft the initial response inside the Workspace."}
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
                    <span className="text-sm font-bold text-zinc-500">Based on AI evaluation of requirements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-px bg-zinc-100" />
                    <span className="text-4xl font-black text-emerald-600 tracking-tight">{aiSummary?.win_probability ? `${aiSummary.win_probability}%` : 'TBD'}</span>
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
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <select 
                        value={knowledgeMode}
                        onChange={(e) => setKnowledgeMode(e.target.value)}
                        className="text-[10px] font-bold text-emerald-600 bg-transparent border-none uppercase tracking-widest outline-none cursor-pointer appearance-none hover:bg-zinc-50 rounded px-1 -ml-1 transition-colors"
                      >
                        <option value="Hybrid">Hybrid Mode</option>
                        <option value="RFP-Only">RFP-Only Mode</option>
                        <option value="Global">Global Mode</option>
                      </select>
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
                      {msg.role === 'ai' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-black mb-4 mt-2 text-zinc-900 border-b border-zinc-100 pb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-4 text-zinc-900" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-zinc-800" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed text-zinc-700" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-zinc-700" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-zinc-700" {...props} />,
                            li: ({node, ...props}) => <li className="leading-relaxed pl-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-zinc-900 bg-zinc-50 px-1 rounded" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-6 border-zinc-100" {...props} />,
                            table: ({node, ...props}) => (
                              <div className="overflow-x-auto my-4 rounded-xl border border-zinc-100">
                                <table className="w-full text-xs text-left" {...props} />
                              </div>
                            ),
                            th: ({node, ...props}) => <th className="bg-zinc-50 p-2 font-bold border-b border-zinc-100" {...props} />,
                            td: ({node, ...props}) => <td className="p-2 border-b border-zinc-50" {...props} />,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : (
                        msg.text
                      )}
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

      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-zinc-900">Assign Architect</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <p className="text-sm text-zinc-500 font-medium">Select a Solution Architect to lead the technical response for this RFP.</p>
            <Select onValueChange={setSelectedArchitect} value={selectedArchitect}>
              <SelectTrigger className="h-12 rounded-xl border-zinc-200 focus:ring-zinc-900/5">
                <SelectValue placeholder="Select an architect" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200">
                {architects.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()} className="focus:bg-zinc-50 rounded-lg py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900">{a.name}</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Solution Architect</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button 
              onClick={handleAssignArchitect} 
              disabled={!selectedArchitect || isAssigning}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold shadow-lg shadow-blue-100"
            >
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDecisionModalOpen} onOpenChange={setIsDecisionModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-zinc-900">
              {pendingDecision === 'approved' ? 'Approve RFP' : 
               pendingDecision === 'rejected' ? 'Reject RFP' : 
               pendingDecision === 'on_hold' ? 'Put on Hold' : 'Submit Decision'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <p className="text-sm text-zinc-500 font-medium">
              Are you sure you want to {pendingDecision?.replace('_', ' ')} this RFP? Please provide a brief reason for your records.
            </p>
            <textarea 
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="Enter reason or comments..."
              className="w-full min-h-[100px] p-4 text-sm font-medium border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all resize-none bg-zinc-50"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsDecisionModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button 
              onClick={handleDecision} 
              disabled={isSubmittingDecision}
              className={cn(
                "rounded-xl px-8 font-bold text-white shadow-lg",
                pendingDecision === 'approved' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" :
                pendingDecision === 'rejected' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100" :
                "bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200"
              )}
            >
              {isSubmittingDecision ? 'Submitting...' : 'Confirm Decision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

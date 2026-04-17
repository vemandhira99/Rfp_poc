'use client'

import { Save, Send, RefreshCw, Download, Sparkles, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'

function WorkspaceDetailContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')?.toLowerCase() || ''
  const rfpId = searchParams.get('id') || '1' // default for testing

  const [aiWidth, setAiWidth] = useState(400)
  const [isResizing, setIsResizing] = useState(false)
  
  const [rfp, setRfp] = useState<any>(null)
  const [draft, setDraft] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [draftContent, setDraftContent] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [knowledgeMode, setKnowledgeMode] = useState('Hybrid')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI Architect Assistant. Ask me anything about this RFP.' }
  ])

  useEffect(() => {
    async function loadData() {
      try {
        const { fetchApi } = await import('@/lib/api')
        const rfpData = await fetchApi(`/rfps/${rfpId}`)
        
        let sumData = null
        try {
           sumData = await fetchApi(`/rfps/${rfpId}/summary`)
        } catch(e) {}

        setRfp({
          ...rfpData,
          client_name: sumData?.client_name || rfpData.client_name || 'Unknown Client',
        })
        
        try {
          const draftData = await fetchApi(`/rfps/${rfpId}/draft`)
          setDraft(draftData)
          setDraftContent(draftData.content || '')
        } catch(e) {
          // No draft exists yet
        }
      } catch (err) {
        console.error("Failed to load backend data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [rfpId])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX - 48;
      if (newWidth > 300 && newWidth < 800) {
        setAiWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const saveDraft = async (isFinal = false) => {
    try {
      const { fetchApi } = await import('@/lib/api')
      await fetchApi(`/rfps/${rfpId}/draft`, {
        method: 'PUT',
        body: JSON.stringify({
          content: draftContent
        })
      })
      alert(isFinal ? 'Draft submitted!' : 'Draft saved successfully!')
    } catch (e) {
      alert('Failed to save draft.')
    }
  }

  const handleRegenerateDraft = async () => {
    if(isRegenerating) return;
    setIsRegenerating(true);
    try {
      const { fetchApi } = await import('@/lib/api')
      const data = await fetchApi(`/ai/rfp/${rfpId}/draft`, { method: 'POST' })
      if(data && data.draft && data.draft.draft_outline) {
         setDraftContent(data.draft.draft_outline + "\n\n" + data.draft.technical_approach)
      }
    } catch (e) {
      alert("Failed to generate AI Draft.")
    } finally {
      setIsRegenerating(false);
    }
  }

  const handleSendMessage = async (e?: React.FormEvent, presetMsg?: string) => {
    e?.preventDefault()
    const msgTemplate = presetMsg || chatInput
    if (!msgTemplate.trim() || isChatLoading) return

    const newMsgs = [...messages, { role: 'user' as const, text: msgTemplate }]
    setMessages(newMsgs)
    setChatInput('')
    setIsChatLoading(true)

    try {
      const { fetchApi } = await import('@/lib/api')
      const data = await fetchApi(`/rfps/${rfpId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ 
          message: msgTemplate, 
          knowledge_mode: knowledgeMode 
        })
      })
      setMessages([...newMsgs, { role: 'ai', text: data.reply }])
    } catch (err) {
      setMessages([...newMsgs, { role: 'ai', text: 'Error connecting to the AI Advisor. Please try again.' }])
    } finally {
      setIsChatLoading(false)
    }
  }


  const allHistoricalReferences = [
    { title: "Cloud Migration - Finance Co", tag: "Finance", match: "95% match" },
    { title: "Enterprise Platform - Tech Inc", tag: "Technology", match: "87% match" },
    { title: "Data Analytics - Healthcare", tag: "Healthcare", match: "76% match" },
  ]

  const historicalReferences = allHistoricalReferences.filter(ref => 
    ref.title.toLowerCase().includes(q) || ref.tag.toLowerCase().includes(q)
  )

  return (
    <div className={`flex h-full gap-0 py-4 max-w-[1600px] mx-auto relative ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      <div className="absolute inset-0 gradient-bg -z-10 rounded-3xl opacity-40 blur-3xl pointer-events-none" />

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="max-w-md">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight mb-2">
              {rfp?.title || "Loading..."}
            </h1>
            <p className="text-sm font-medium text-zinc-500">Workspace / Draft V{draft?.version || 1}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleRegenerateDraft} disabled={isRegenerating} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 bg-white transition-all active:scale-95 shadow-sm disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Drafting...' : 'Regenerate'}
            </button>
            <button onClick={() => saveDraft(false)} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 bg-white transition-all active:scale-95 shadow-sm">
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            <button onClick={() => saveDraft(true)} className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              <Send className="w-3.5 h-3.5" />
              Submit for Review
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Card 1 */}
          <div className="glass-card hover-lift rounded-2xl p-6 relative group">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">Uploaded RFP</span>
            <div onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/uploads/rfp/${rfpId}/download`)} className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-600 cursor-pointer transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight">{rfp?.file_name || 'No file found'}</p>
            <p className="text-xs font-medium text-zinc-500 mt-1">{rfp?.file_size_kb ? Math.round(rfp.file_size_kb/1024) + ' MB' : ''}</p>
          </div>
          {/* Card 2 */}
          <div className="border border-indigo-100/50 rounded-2xl p-6 bg-indigo-50/30 backdrop-blur-xl shadow-sm hover-lift relative group">
             <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">
               <Sparkles className="w-4 h-4 animate-pulse" /> AI Generated Response
             </span>
             <div onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/rfps/${rfpId}/export`)} className="absolute top-6 right-6 text-indigo-300 hover:text-indigo-600 cursor-pointer transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight">Response_Draft_v{draft?.version || 1}.docx</p>
            <p className="text-xs font-medium text-zinc-500 mt-1">Ready for export</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-lg font-black text-zinc-900 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
              Project Overview
            </h3>
            <p className="text-zinc-600 text-sm leading-relaxed font-medium">
              {rfp?.client_name ? `Client: ${rfp.client_name}` : "Loading project..."}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-lg font-black text-zinc-900 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-zinc-900 rounded-full" />
              Draft Content
            </h3>
            <textarea 
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full text-base font-medium border-none bg-zinc-50 rounded-lg resize-y outline-none placeholder:text-zinc-400 p-4 h-64"
              placeholder="Write your draft here..."
            />
          </div>
        </div>
      </div>

      {/* Resizer Handle */}
      <div 
        className="w-1 mx-4 bg-zinc-200/50 hover:bg-indigo-500/50 cursor-col-resize rounded-full transition-colors flex items-center justify-center relative group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute inset-y-0 -inset-x-2 z-10" />
        <div className={`w-0.5 h-10 rounded-full transition-colors ${isResizing ? 'bg-indigo-600' : 'bg-transparent group-hover:bg-zinc-400'}`} />
      </div>

      {/* Side Column: AI Assistant */}
      <div className="flex-shrink-0 space-y-8" style={{ width: aiWidth }}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-base font-black text-zinc-900 uppercase tracking-wider">
              <Sparkles className="w-5 h-5 text-indigo-600" /> AI Assistant
            </h2>
            <select 
              value={knowledgeMode}
              onChange={(e) => setKnowledgeMode(e.target.value)}
              className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 border-none uppercase tracking-widest outline-none cursor-pointer appearance-none hover:bg-indigo-100/50 rounded-lg px-2 py-1 transition-all"
            >
              <option value="Hybrid">Hybrid</option>
              <option value="RFP-Only">RFP-Only</option>
              <option value="Global">Global</option>
            </select>
          </div>
          
          <div className="glass-card rounded-2xl flex flex-col mb-4 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all h-[400px]">
             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm font-medium leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' 
                      : 'bg-white/80 border border-zinc-200/50 text-zinc-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/80 border border-zinc-200/50 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
            {/* Input Area */}
            <div className="p-3 bg-zinc-50/50 border-t border-zinc-100/50">
              <textarea 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to help with your response..."
                className="w-full text-sm font-medium border-none bg-transparent resize-none outline-none placeholder:text-zinc-400 h-16"
              />
            </div>
          </div>
          
          <button 
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isChatLoading}
            className="w-full bg-zinc-900 text-white py-3.5 rounded-xl text-sm font-black shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 mb-8"
          >
            {isChatLoading ? 'Thinking...' : 'Send Message'}
          </button>

          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-1">Suggested:</p>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              "Improve technical accuracy",
              "Generate architecture diagram",
              "Validate compliance coverage"
            ].map((suggestion, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSendMessage(undefined, suggestion)}
                className="w-full text-left px-4 py-3 border border-zinc-200/80 rounded-xl text-[11px] font-black text-zinc-600 hover:border-indigo-600 hover:text-indigo-600 bg-white/60 backdrop-blur-md transition-all shadow-sm active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">References</h3>
            <Search className="w-4 h-4 text-zinc-300 hover:text-zinc-600 cursor-pointer transition-colors" />
          </div>
          
          <div className="space-y-3">
            {historicalReferences.length === 0 ? (
              <p className="text-zinc-500 text-[10px] font-bold italic ml-1">No references found for "{q}"</p>
            ) : (
              historicalReferences.map((ref, idx) => (
                <div key={idx} className="glass-card hover-lift rounded-2xl p-5 relative group">
                  <h4 className="text-sm font-bold text-zinc-900 mb-3 group-hover:text-indigo-600 transition-colors leading-snug">{ref.title}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{ref.tag}</span>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">{ref.match}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkspaceDetail() {
  return (
    <Suspense fallback={<div>Loading workspace details...</div>}>
      <WorkspaceDetailContent />
    </Suspense>
  )
}

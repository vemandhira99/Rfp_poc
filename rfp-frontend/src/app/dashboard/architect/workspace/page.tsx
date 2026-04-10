'use client'

import { Save, Send, RefreshCw, Download, Sparkles, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'

function WorkspaceDetailContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')?.toLowerCase() || ''

  const [aiWidth, setAiWidth] = useState(384) // Default w-96 roughly (384px)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Calculate width from right edge of window
      const newWidth = window.innerWidth - e.clientX - 48; // Account for paddings
      if (newWidth > 250 && newWidth < 800) {
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

  const allHistoricalReferences = [
    { title: "Cloud Migration - Finance Co", tag: "Finance", match: "95% match" },
    { title: "Enterprise Platform - Tech Inc", tag: "Technology", match: "87% match" },
    { title: "Data Analytics - Healthcare", tag: "Healthcare", match: "76% match" },
  ]

  const historicalReferences = allHistoricalReferences.filter(ref => 
    ref.title.toLowerCase().includes(q) || ref.tag.toLowerCase().includes(q)
  )

  return (
    <div className={`flex h-full py-2 min-h-[calc(100vh-4rem)] w-full relative ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      <div className="absolute inset-0 gradient-bg -z-10 rounded-3xl opacity-60 blur-3xl pointer-events-none" />

      {/* Column 1: Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 max-w-xl leading-tight">Enterprise Cloud Migration Platform</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-900 hover:bg-zinc-50 bg-white transition-colors">
              <RefreshCw className="w-4 h-4 text-zinc-600" />
              Regenerate
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-900 hover:bg-zinc-50 bg-white transition-colors">
              <Save className="w-4 h-4 text-zinc-600" />
              Save
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4" />
              Submit for Review
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Card 1 */}
          <div className="border border-zinc-200 rounded-2xl p-6 bg-white/70 backdrop-blur-xl shadow-sm flex flex-col items-start relative hover-lift">
            <span className="text-xs font-semibold text-zinc-500 tracking-wide mb-3 uppercase">Uploaded RFP</span>
            <div className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-zinc-900">RFP_GlobalTech_2026.pdf</p>
            <p className="text-sm font-medium text-zinc-500 mt-1.5">42 pages • 2.3 MB</p>
          </div>
          {/* Card 2 */}
          <div className="border border-blue-200/60 rounded-2xl p-6 bg-[#F8FAFC]/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(37,99,235,0.06)] flex flex-col items-start relative hover-lift">
             <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-[#2563EB] mb-3">
               <Sparkles className="w-3.5 h-3.5" /> AI Generated Response
             </span>
             <div className="absolute top-6 right-6 text-[#2563EB]/70 hover:text-[#2563EB] cursor-pointer transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-zinc-900">Response_Draft_v1.docx</p>
            <p className="text-sm font-medium text-zinc-500 mt-1.5">Generated 2 hours ago</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 mb-6">
          <h3 className="text-xl font-bold text-zinc-900 mb-4">Project Overview</h3>
          <p className="text-zinc-600 font-medium text-base leading-relaxed">
            Global Tech Corp is seeking a comprehensive cloud migration platform to transition their on-premise infrastructure to AWS. The solution must support 200+ applications, ensure zero downtime during migration, and provide automated testing and rollback capabilities.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-xl font-bold text-zinc-900 mb-5">Key Requirements</h3>
          <ul className="space-y-4">
            {[
              "Support for 200+ applications across multiple environments",
              "Zero-downtime migration strategy",
              "Automated testing and rollback mechanisms",
              "Compliance with SOC2, HIPAA, and GDPR"
            ].map((req, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-2 w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0" />
                <span className="text-base font-medium text-zinc-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Resizer Handle */}
      <div 
        className="w-1.5 mx-6 bg-zinc-200/50 hover:bg-blue-500/50 cursor-col-resize rounded-full transition-colors flex items-center justify-center relative group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute inset-y-0 -inset-x-2 z-10" />
        <div className={`w-1 h-8 rounded-full transition-colors ${isResizing ? 'bg-blue-600' : 'bg-transparent group-hover:bg-zinc-400'}`} />
      </div>

      {/* Column 2: AI Assistant */}
      <div className="flex-shrink-0" style={{ width: aiWidth }}>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-zinc-900 mb-5 tracking-tight">
          <Sparkles className="w-5 h-5 text-[#2563EB]" /> AI Assistant
        </h2>
        
        <div className="glass-card rounded-2xl p-4 mb-4 flex flex-col">
          <textarea 
            placeholder="Ask AI to help with your response or summarize documents..."
            className="w-full text-base font-medium border-none bg-transparent resize-y outline-none placeholder:text-zinc-400 min-h-[250px] focus:ring-0"
          />
        </div>
        
        <button className="w-full bg-[#2563EB] text-white py-3.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 hover:shadow-blue-500/20 transition-all mb-8">
          Send to AI
        </button>

        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Suggested Actions</h3>
        <div className="space-y-3 mb-10">
          {[
            "Improve technical accuracy",
            "Generate architecture diagram",
            "Validate compliance coverage",
            "Suggest risk mitigations"
          ].map((suggestion, idx) => (
            <button key={idx} className="w-full text-left px-4 py-3 border border-white/60 bg-white/60 backdrop-blur-md rounded-xl text-sm font-bold text-zinc-800 hover:bg-white hover-lift transition-all shadow-sm">
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Historical References</h3>
          <Search className="w-4 h-4 text-zinc-400 cursor-pointer hover:text-zinc-700 transition-colors" />
        </div>
        
        <div className="space-y-4">
          {historicalReferences.length === 0 ? (
            <p className="text-zinc-500 text-sm italic font-medium">No references found for "{q}"</p>
          ) : (
            historicalReferences.map((ref, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-5 hover-lift">
                <h4 className="text-base font-bold text-zinc-900 mb-2.5">{ref.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-zinc-500 px-2 py-1 bg-zinc-100 rounded-md">{ref.tag}</span>
                  <span className="text-sm font-bold text-emerald-500">{ref.match}</span>
                </div>
              </div>
            ))
          )}
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

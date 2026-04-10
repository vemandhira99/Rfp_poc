'use client'

import { Save, Send, RefreshCw, Download, Sparkles, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function WorkspaceDetailContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')?.toLowerCase() || ''

  const allHistoricalReferences = [
    { title: "Cloud Migration - Finance Co", tag: "Finance", match: "95% match" },
    { title: "Enterprise Platform - Tech Inc", tag: "Technology", match: "87% match" },
    { title: "Data Analytics - Healthcare", tag: "Healthcare", match: "76% match" },
  ]

  const historicalReferences = allHistoricalReferences.filter(ref => 
    ref.title.toLowerCase().includes(q) || ref.tag.toLowerCase().includes(q)
  )

  return (
    <div className="flex h-full gap-10 py-4 max-w-7xl mx-auto">
      {/* Main Content Column */}
      <div className="flex-1 min-w-0 pr-10 border-r border-zinc-200/60">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-none mb-2">Enterprise Cloud Migration Platform</h1>
            <p className="text-sm font-medium text-zinc-500">Workspace / Draft V1</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2.5 px-5 py-2.5 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 bg-white transition-all active:scale-95 shadow-sm">
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button className="flex items-center gap-2.5 px-5 py-2.5 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 bg-white transition-all active:scale-95 shadow-sm">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              <Send className="w-4 h-4" />
              Submit for Review
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Card 1 */}
          <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all group relative">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">Uploaded RFP</span>
            <div className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-600 cursor-pointer transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight">RFP_GlobalTech_2026.pdf</p>
            <p className="text-xs font-medium text-zinc-500 mt-1">42 pages • 2.3 MB</p>
          </div>
          {/* Card 2 */}
          <div className="border border-indigo-100 rounded-2xl p-6 bg-indigo-50/30 shadow-sm hover:shadow-md transition-all group relative backdrop-blur-sm">
             <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">
               <Sparkles className="w-4 h-4 animate-pulse" /> AI Generated Response
             </span>
             <div className="absolute top-6 right-6 text-indigo-300 hover:text-indigo-600 cursor-pointer transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight">Response_Draft_v1.docx</p>
            <p className="text-xs font-medium text-zinc-500 mt-1">Generated 2 hours ago</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-zinc-200/80 rounded-2xl p-8 bg-white shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
              Project Overview
            </h3>
            <p className="text-zinc-600 text-sm leading-relaxed font-medium">
              Global Tech Corp is seeking a comprehensive cloud migration platform to transition their on-premise infrastructure to AWS. The solution must support 200+ applications, ensure zero downtime during migration, and provide automated testing and rollback capabilities.
            </p>
          </div>

          <div className="border border-zinc-200/80 rounded-2xl p-8 bg-white shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-zinc-900 rounded-full" />
              Key Requirements
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {[
                "Support for 200+ applications across environments",
                "Zero-downtime migration strategy",
                "Automated testing and rollback mechanisms",
                "Compliance with SOC2, HIPAA, and GDPR"
              ].map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover:bg-indigo-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Side Column: AI Assistant */}
      <div className="w-80 flex-shrink-0 pl-4 space-y-8">
        <div>
          <h2 className="flex items-center gap-2 text-base font-black text-zinc-900 mb-6 uppercase tracking-wider">
            <Sparkles className="w-5 h-5 text-indigo-600" /> AI Assistant
          </h2>
          
          <div className="border border-zinc-200/80 rounded-2xl p-4 bg-white shadow-sm mb-4 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <textarea 
              placeholder="Ask AI to help with your response..."
              className="w-full text-sm font-medium border-none bg-transparent resize-none outline-none placeholder:text-zinc-400 h-28"
            />
          </div>
          
          <button className="w-full bg-zinc-900 text-white py-3.5 rounded-xl text-sm font-black shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95 mb-8">
            Send Message
          </button>

          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-1">Suggested:</p>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              "Improve technical accuracy",
              "Generate architecture diagram",
              "Validate compliance coverage"
            ].map((suggestion, idx) => (
              <button key={idx} className="w-full text-left px-4 py-3 border border-zinc-200/80 rounded-xl text-[11px] font-black text-zinc-600 hover:border-indigo-600 hover:text-indigo-600 bg-white transition-all shadow-sm active:scale-95">
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
                <div key={idx} className="border border-zinc-200/80 rounded-2xl p-5 bg-white shadow-sm hover:border-indigo-200 transition-all group">
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

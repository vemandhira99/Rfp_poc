'use client'

import { Save, Send, RefreshCw, Download, Sparkles, Search } from 'lucide-react'

export default function WorkspaceDetail() {
  const sections = ["Overview", "Scope", "Requirements", "Compliance", "Architecture", "Past Responses", "Final Draft"]

  return (
    <div className="flex h-full gap-8 py-2">
      {/* Column 1: Left Navigation */}
      <div className="w-56 flex-shrink-0">
        <h2 className="text-base font-bold text-zinc-900 mb-4 px-3">Sections</h2>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                section === "Overview" 
                  ? "bg-white border border-zinc-200 text-zinc-900 font-bold shadow-sm" 
                  : "text-zinc-900 font-medium hover:bg-zinc-50"
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </div>

      {/* Column 2: Main Content */}
      <div className="flex-1 min-w-0 pr-8 border-r border-zinc-200">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 max-w-sm leading-tight">Enterprise Cloud Migration Platform</h1>
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Card 1 */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white shadow-sm flex flex-col items-start relative">
            <span className="text-xs font-medium text-zinc-500 mb-3">Uploaded RFP</span>
            <div className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 cursor-pointer">
              <Download className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-zinc-900">RFP_GlobalTech_2026.pdf</p>
            <p className="text-xs text-zinc-500 mt-1.5">42 pages • 2.3 MB</p>
          </div>
          {/* Card 2 */}
          <div className="border border-blue-100 rounded-xl p-5 bg-[#F4F9FF] shadow-sm flex flex-col items-start relative">
             <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] mb-3">
               <Sparkles className="w-3.5 h-3.5" /> AI Generated Response
             </span>
             <div className="absolute top-5 right-5 text-blue-500 hover:text-blue-700 cursor-pointer">
              <Download className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-zinc-900">Response_Draft_v1.docx</p>
            <p className="text-xs text-zinc-500 mt-1.5">Generated 2 hours ago</p>
          </div>
        </div>

        <div className="border border-zinc-200 rounded-xl p-6 bg-white shadow-sm mb-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Project Overview</h3>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Global Tech Corp is seeking a comprehensive cloud migration platform to transition their on-premise infrastructure to AWS. The solution must support 200+ applications, ensure zero downtime during migration, and provide automated testing and rollback capabilities.
          </p>
        </div>

        <div className="border border-zinc-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Key Requirements</h3>
          <ul className="space-y-3.5">
            {[
              "Support for 200+ applications across multiple environments",
              "Zero-downtime migration strategy",
              "Automated testing and rollback mechanisms",
              "Compliance with SOC2, HIPAA, and GDPR"
            ].map((req, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-sm font-medium text-zinc-600">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Column 3: AI Assistant */}
      <div className="w-64 flex-shrink-0 pl-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 mb-4">
          <Sparkles className="w-5 h-5 text-[#2563EB]" /> AI Assistant
        </h2>
        
        <div className="border border-zinc-200 rounded-xl p-3 bg-white shadow-sm mb-3">
          <textarea 
            placeholder="Ask AI to help with your response..."
            className="w-full text-sm border-none bg-transparent resize-none outline-none placeholder:text-zinc-400 h-24"
          />
        </div>
        
        <button className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors mb-6">
          Send
        </button>

        <h3 className="text-xs font-semibold text-zinc-500 mb-3">Suggested:</h3>
        <div className="space-y-2 mb-8">
          {[
            "Improve technical accuracy",
            "Generate architecture diagram",
            "Validate compliance coverage",
            "Suggest risk mitigations"
          ].map((suggestion, idx) => (
            <button key={idx} className="w-full text-left px-3 py-2 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 hover:bg-zinc-50 bg-white transition-colors shadow-sm">
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-zinc-900">Historical References</h3>
          <Search className="w-4 h-4 text-zinc-400 cursor-pointer" />
        </div>
        
        <div className="space-y-3">
          {[
            { title: "Cloud Migration - Finance Co", tag: "Finance", match: "95% match" },
            { title: "Enterprise Platform - Tech Inc", tag: "Technology", match: "87% match" },
            { title: "Data Analytics - Healthcare", tag: "Healthcare", match: "76% match" },
          ].map((ref, idx) => (
            <div key={idx} className="border border-zinc-200 rounded-xl p-4 bg-white shadow-sm">
              <h4 className="text-sm font-bold text-zinc-900 mb-2">{ref.title}</h4>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{ref.tag}</span>
                <span className="text-xs font-bold text-emerald-500">{ref.match}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

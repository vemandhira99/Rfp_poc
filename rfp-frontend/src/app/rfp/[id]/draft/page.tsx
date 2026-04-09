'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Sparkles, Save, CheckCircle2, Bot, BookOpen, Layers, SendHorizontal } from 'lucide-react'
import { MOCK_RFPS } from '@/lib/mocks/rfpData'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function ArchitectWorkspacePage() {
  const params = useParams()
  const id = params.id as string
  const rfp = MOCK_RFPS.find(r => r.id === id) || MOCK_RFPS[0]

  const [activeTab, setActiveTab] = useState('approach')

  // Mock initial content for editor based on tabs
  const initialContent = {
    approach: `<h1>Solution Approach</h1><p>Our proposed solution leverages our enterprise-grade platform...</p>`,
    architecture: `<h1>Architecture Design</h1><p>The system will be deployed using a multi-region highly available design...</p>`,
    implementation: `<h1>Implementation Plan</h1><p>The project will be delivered in 4 phases over 6 months...</p>`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] -mx-8 -my-8 px-4 py-4 overflow-hidden">
      
      {/* Workspace Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Technical Workspace</h2>
          <p className="text-sm text-zinc-500">{rfp.title}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-zinc-600 bg-white">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button className="bg-black hover:bg-zinc-800 text-white">
            <SendHorizontal className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden h-full">
        
        {/* LEFT PANEL - Requirements Tracker */}
        <div className="w-[300px] flex flex-col bg-white border border-zinc-200 rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-900 flex items-center justify-between">
            <span>Requirements</span>
            <span className="text-xs font-normal text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded-full">
              {rfp.requirements.length} total
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {rfp.requirements.map(req => (
              <div key={req.id} className="p-3 border border-zinc-200 rounded-md bg-white hover:border-zinc-300 transition-colors">
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 w-4 h-4 accent-black rounded border-zinc-300" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">{req.title}</h4>
                    <p className="text-xs text-zinc-600 mt-1">{req.description}</p>
                    {req.mandatory && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        MANDATORY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL - TipTap Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
          <div className="border-b border-zinc-200 bg-zinc-50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="approach" 
                  className="data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-t-black data-[state=active]:shadow-none rounded-none h-full px-6 font-medium"
                >
                  Solution Approach
                </TabsTrigger>
                <TabsTrigger 
                  value="architecture" 
                  className="data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-t-black data-[state=active]:shadow-none rounded-none h-full px-6 font-medium"
                >
                  Architecture
                </TabsTrigger>
                <TabsTrigger 
                  value="implementation" 
                  className="data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-t-black data-[state=active]:shadow-none rounded-none h-full px-6 font-medium"
                >
                  Implementation Plan
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1 overflow-hidden p-0 relative bg-white">
            {activeTab === 'approach' && <TipTapEditor content={initialContent.approach} />}
            {activeTab === 'architecture' && <TipTapEditor content={initialContent.architecture} />}
            {activeTab === 'implementation' && <TipTapEditor content={initialContent.implementation} />}
          </div>
        </div>

        {/* RIGHT PANEL - AI Assist */}
        <div className="w-[300px] flex flex-col bg-white border border-zinc-200 rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 bg-blue-50 text-sm font-semibold text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI Co-Pilot
          </div>
          
          <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-4 space-y-6">
            
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> Suggested Content
              </h4>
              <div className="p-3 bg-white border border-blue-100 rounded-md shadow-sm">
                <p className="text-xs text-zinc-700">Based on the mandatory requirement <strong>{rfp.requirements[0]?.title}</strong>, I successfully generated a baseline compliance response.</p>
                <Button variant="outline" size="sm" className="w-full mt-3 text-blue-600 border-blue-200 hover:bg-blue-50">
                  Insert Draft Text
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Reusable Blocks
              </h4>
              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-zinc-200 rounded-md cursor-pointer hover:border-zinc-400 group transition-colors">
                  <p className="text-xs font-semibold text-zinc-900 group-hover:text-black">Standard SLAs (Enterprise)</p>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-md cursor-pointer hover:border-zinc-400 group transition-colors">
                  <p className="text-xs font-semibold text-zinc-900 group-hover:text-black">Security Architecture V2</p>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-md cursor-pointer hover:border-zinc-400 group transition-colors">
                  <p className="text-xs font-semibold text-zinc-900 group-hover:text-black">Support Team Setup</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Past Analogous RFPs
              </h4>
              <div className="p-3 bg-white border border-zinc-200 rounded-md shadow-sm text-center">
                <p className="text-xs text-zinc-500 mb-2">No direct matches found for this specific industry vertical.</p>
                <Button variant="link" size="sm" className="text-blue-600 h-auto p-0">Search all archives</Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

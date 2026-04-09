'use client'

import { useParams } from 'next/navigation'
import { FileText, FileSpreadsheet, Presentation, Download, Share2 } from 'lucide-react'
import { MOCK_RFPS } from '@/lib/mocks/rfpData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ExportPage() {
  const params = useParams()
  const id = params.id as string
  const rfp = MOCK_RFPS.find(r => r.id === id) || MOCK_RFPS[0]

  const exportOptions = [
    {
      title: 'Full Proposal Document',
      description: 'The complete technical and commercial response, formatted in the client\'s requested structure.',
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      type: 'DOCX / PDF',
      size: '2.4 MB'
    },
    {
      title: 'Compliance Matrix',
      description: 'A line-by-line spreadsheet of all requirements and our specific compliance posture.',
      icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600" />,
      type: 'XLSX / CSV',
      size: '145 KB'
    },
    {
      title: 'Executive Summary',
      description: 'A 2-page brief highlighting ROI, strategic fit, and core capabilities for leadership.',
      icon: <Presentation className="w-8 h-8 text-purple-600" />,
      type: 'PDF / PPTX',
      size: '1.1 MB'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Export & Share</h2>
          <p className="text-sm text-zinc-500 mt-1">Generate final deliverables for {rfp.client}</p>
        </div>
        <Button variant="outline" className="text-zinc-700 bg-white border-zinc-300">
          <Share2 className="w-4 h-4 mr-2" />
          Share via Email
        </Button>
      </div>

      <div className="grid gap-6">
        {exportOptions.map((option, i) => (
          <Card key={i} className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 group-hover:bg-white group-hover:border-zinc-200 transition-colors">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">{option.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1 max-w-xl">{option.description}</p>
                    <div className="flex gap-4 mt-3">
                      <span className="text-xs font-medium text-zinc-400">Format: <span className="text-zinc-700">{option.type}</span></span>
                      <span className="text-xs font-medium text-zinc-400">Est. Size: <span className="text-zinc-700">{option.size}</span></span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white flex-shrink-0">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}

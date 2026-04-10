'use client'

import { useState, useRef } from 'react'
import { 
  Upload, 
  X, 
  ArrowLeft, 
  FileText, 
  Computer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadRfpModalProps {
  isOpen: boolean
  onClose: () => void
}

type UploadStep = 'selection' | 'upload'

export function UploadRfpModal({ isOpen, onClose }: UploadRfpModalProps) {
  const [step, setStep] = useState<UploadStep>('selection')
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setStep('selection')
    setFiles([])
    onClose()
  }

  const handleBack = () => {
    setStep('selection')
  }

  const handleSelection = () => {
    setStep('upload')
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const triggerFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = () => {
    // In a real app, this would handle the upload process
    console.log('Uploading files:', files)
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <DialogTitle className="text-2xl font-bold text-zinc-900">Upload RFP Document</DialogTitle>
          </div>

          {step === 'selection' ? (
            <div className="space-y-6">
              <p className="text-zinc-500 font-medium">Choose where to upload your RFP from:</p>
              
              <button 
                onClick={handleSelection}
                className="w-full flex items-center gap-6 p-6 rounded-2xl border border-zinc-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Upload className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">Upload from Computer</h3>
                  <p className="text-sm text-zinc-500 mt-1">Select PDF, DOCX, or other document files from your device</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={handleBack}
                className="flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to options
              </button>

              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={triggerFilePicker}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center",
                  isDragging 
                    ? "border-blue-400 bg-blue-50/50" 
                    : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300",
                  files.length > 0 && "border-blue-200 bg-blue-50/30"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onFileSelect} 
                  className="hidden" 
                  multiple 
                  accept=".pdf,.docx,.doc,.txt"
                />
                
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-zinc-100">
                  <Upload className={cn("w-8 h-8", files.length > 0 ? "text-blue-600" : "text-zinc-400")} />
                </div>

                {files.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-bold text-zinc-900">
                      {files.length === 1 ? files[0].name : `${files.length} files selected`}
                    </p>
                    <p className="text-xs text-zinc-500">Click to change selection</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-zinc-900">Click to browse or drag and drop</p>
                    <p className="text-sm text-zinc-500">Supported formats: PDF, DOCX, DOC, TXT (Max 50MB)</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleUpload}
                  disabled={files.length === 0}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="h-12 border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl px-8"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download } from 'lucide-react'
import { downloadFromUrlOrData } from '@/lib/client/download'

type Props = {
  open: boolean
  title: string
  description?: string
  src?: string
  fallbackData?: string
  onOpenChange: (open: boolean) => void
  downloadName?: string
}

export default function PreviewModal({ open, title, description, src, fallbackData, onOpenChange, downloadName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          {src && <img src={src} alt={title} className="w-full h-full object-contain" />}
          {!src && <div className="text-sm text-gray-500">No preview available</div>}
        </div>
        <DialogFooter>
          <button
            onClick={() => downloadFromUrlOrData({ url: src, filename: downloadName || 'download', dataText: fallbackData })}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



"use client"

import { useState } from "react"
import FilesHub from "@/components/hubs/files-hub"

export default function FilesHubPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  
  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(prev => [...files, ...prev])
    console.log('Files uploaded:', files)
  }
  
  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    console.log('File deleted:', fileId)
  }
  
  const handleFileShare = (fileId: string) => {
    console.log('File shared:', fileId)
  }
  
  return (
    <div className="p-6">
      <FilesHub
        userId="current-user"
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
        onFileShare={handleFileShare}
      />
    </div>
  )
}

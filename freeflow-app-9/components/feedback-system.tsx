"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageViewer } from "./feedback/image-viewer"
import { VideoViewer } from "./feedback/video-viewer"
import { AudioViewer } from "./feedback/audio-viewer"
import { DocumentViewer } from "./feedback/document-viewer"
import { CodeViewer } from "./feedback/code-viewer"
import { ScreenshotViewer } from "./feedback/screenshot-viewer"

const mediaFiles = [
  {
    id: "1",
    name: "Brand Logo.png",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "2.1 MB",
  },
  {
    id: "2",
    name: "Product Demo.mp4",
    type: "video",
    url: "/placeholder.svg?height=300&width=500",
    size: "45.2 MB",
    duration: "2:15",
  },
  {
    id: "3",
    name: "Podcast Episode.mp3",
    type: "audio",
    url: "/placeholder.svg?height=200&width=400",
    size: "12.8 MB",
    duration: "15:30",
  },
  {
    id: "4",
    name: "Project Brief.pdf",
    type: "document",
    url: "/placeholder.svg?height=500&width=400",
    size: "1.5 MB",
  },
  {
    id: "5",
    name: "main.tsx",
    type: "code",
    url: "",
    size: "4.2 KB",
  },
  {
    id: "6",
    name: "UI Mockup.png",
    type: "screenshot",
    url: "/placeholder.svg?height=600&width=800",
    size: "3.7 MB",
  },
]

export function FeedbackSystem() {
  const [selectedFile, setSelectedFile] = useState(mediaFiles[0])
  const [comments, setComments] = useState<any[]>([])

  const renderViewer = () => {
    switch (selectedFile.type) {
      case "image":
        return <ImageViewer file={selectedFile} comments={comments} onAddComment={setComments} />
      case "video":
        return <VideoViewer file={selectedFile} comments={comments} onAddComment={setComments} />
      case "audio":
        return <AudioViewer file={selectedFile} comments={comments} onAddComment={setComments} />
      case "document":
        return <DocumentViewer file={selectedFile} comments={comments} onAddComment={setComments} />
      case "code":
        return <CodeViewer file={selectedFile} comments={comments} onAddComment={setComments} />
      case "screenshot":
        return <ScreenshotViewer file={selectedFile} comments={comments} onAddComment={setComments} />
      default:
        return <div>Unsupported file type</div>
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️"
      case "video":
        return "🎥"
      case "audio":
        return "🎵"
      case "document":
        return "📄"
      case "code":
        return "💻"
      case "screenshot":
        return "📱"
      default:
        return "📁"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
      {/* File List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Project Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFile.id === file.id
                    ? "bg-blue-100 border-2 border-blue-300"
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                }`}
                onClick={() => setSelectedFile(file)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                      <span>{file.size}</span>
                      {file.duration && <span>{file.duration}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Media Viewer */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>{getFileIcon(selectedFile.type)}</span>
                <span>{selectedFile.name}</span>
              </CardTitle>
              <Badge variant="secondary">{selectedFile.type.toUpperCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">{renderViewer()}</CardContent>
        </Card>
      </div>
    </div>
  )
}

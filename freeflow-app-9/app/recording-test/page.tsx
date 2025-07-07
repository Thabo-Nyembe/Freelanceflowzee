'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import VideoMessageRecorder from '@/components/video/VideoMessageRecorder'

export default function RecordingTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRecordingComplete = (videoUrl: string, videoId: string) => {
    console.log('Recording complete:', { videoUrl, videoId })
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Video Recording Test
          </h1>
          <p className="text-gray-600">
            Test the video recording functionality with screen capture and webcam.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Video Recording</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to open the video recording modal and test the functionality.
          </p>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                Record Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Record Video Feedback</DialogTitle>
              </DialogHeader>
              <VideoMessageRecorder
                onRecordingComplete={handleRecordingComplete}
                assetId="test-asset-123"
              />
            </DialogContent>
          </Dialog>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>1. Click "Record Feedback" to open the recording modal</li>
              <li>2. Click "Prepare to Record" to initialize the recorder</li>
              <li>3. Enable camera and/or screen sharing</li>
              <li>4. Start recording and test the functionality</li>
              <li>5. Stop recording and verify the video is processed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
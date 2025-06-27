'use client'

import { Button } from '@/components/ui/button'

export default function DemoFeaturesPage() {
  return (
    <div className="container mx-auto p-8">
      <h1>Demo Features</h1>
      <div data-testid="ai-create" className="mt-4">
        <h2>AI Create Studio</h2>
        <p>Experience our AI-powered content creation tools</p>
        <Button data-testid="ai-create-button">Try AI Create</Button>
      </div>
      
      <div data-testid="file-upload" className="mt-8">
        <h2>File Upload System</h2>
        <input type="file" data-testid="file-input" />
        <Button data-testid="upload-button">Upload File</Button>
      </div>
      
      <div data-testid="download-section" className="mt-8">
        <h2>Download Manager</h2>
        <Button data-testid="download-button">Download Sample</Button>
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileArchive, AlertCircle, CheckCircle } from 'lucide-react'

export default function ImportProjectPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!uploadedFile) return
    
    setImporting(true)
    
    // Simulate import process
    setTimeout(() => {
      setImporting(false)
      alert(`Project imported successfully from "${uploadedFile.name}"! Redirecting to project dashboard...`)
      router.push('/dashboard/projects-hub')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Import Project
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Upload your existing project files and data
            </p>
          </div>
        </div>

        {/* Import Instructions */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Import Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Supported Formats:</h4>
                <ul className="space-y-1">
                  <li>• ZIP archives (.zip)</li>
                  <li>• TAR archives (.tar, .tar.gz)</li>
                  <li>• RAR archives (.rar)</li>
                  <li>• Project folders (compressed)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                <ul className="space-y-1">
                  <li>• Maximum file size: 500MB</li>
                  <li>• Include project.json metadata</li>
                  <li>• Assets in organized folders</li>
                  <li>• Valid project structure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Area */}
        <Card className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Upload className="h-6 w-6 text-purple-600" />
              Upload Project Files
            </CardTitle>
            <CardDescription>
              Drag and drop your project archive or click to browse
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-0">
            {/* Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">File Ready for Import</p>
                    <p className="text-gray-600">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setUploadedFile(null)}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileArchive className="h-16 w-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Drop your project archive here
                    </p>
                    <p className="text-gray-600">
                      or click to browse files
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        Browse Files
                      </Button>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".zip,.tar,.tar.gz,.rar"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Import Button */}
            {uploadedFile && (
              <div className="flex gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={importing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  disabled={importing}
                >
                  {importing ? 'Importing...' : 'Import Project'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
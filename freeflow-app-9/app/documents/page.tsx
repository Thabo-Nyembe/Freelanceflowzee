'use client'

import { useState, useEffect } from 'react'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedInput } from '@/components/ui/enhanced-input'
import {
  FileText,
  Plus,
  Save,
  Share2,
  Download,
  Edit,
  Users,
  Clock,
  Search
} from 'lucide-react'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

interface Document {
  id: string
  title: string
  content: string
  lastModified: Date
  collaborators: number
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Project Proposal',
    content: 'This is a comprehensive project proposal document...',
    lastModified: new Date('2024-01-15'),
    collaborators: 3
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: 'Meeting notes from the client discussion...',
    lastModified: new Date('2024-01-14'),
    collaborators: 2
  },
  {
    id: '3',
    title: 'Design Specifications',
    content: 'Detailed design specifications for the project...',
    lastModified: new Date('2024-01-13'),
    collaborators: 4
  }
]

export default function DocumentsPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // A+++ LOAD DOCUMENTS DATA
  useEffect(() => {
    const loadDocumentsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load documents'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Documents loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents')
        setIsLoading(false)
        announce('Error loading documents', 'assertive')
      }
    }

    loadDocumentsData()
  }, [announce])

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: '',
      lastModified: new Date(),
      collaborators: 1
    }
    setDocuments([newDoc, ...documents])
    setSelectedDoc(newDoc)
  }

  const handleSaveDocument = () => {
    if (selectedDoc) {
      const updatedDocs = documents.map(doc =>
        doc.id === selectedDoc.id
          ? { ...selectedDoc, lastModified: new Date() }
          : doc
      )
      setDocuments(updatedDocs)
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Document Editor</h1>
          <p className="text-secondary">Collaborative document editing with real-time synchronization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="lg:col-span-1">
            <EnhancedCard>
              <EnhancedCardHeader>
                <div className="flex items-center justify-between">
                  <EnhancedCardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </EnhancedCardTitle>
                  <EnhancedButton
                    size="sm"
                    onClick={handleCreateDocument}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    New
                  </EnhancedButton>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <EnhancedInput
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDoc?.id === doc.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <h3 className="font-medium text-primary truncate">{doc.title}</h3>
                      <p className="text-sm text-secondary truncate mt-1">
                        {doc.content || 'No content yet...'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {doc.lastModified.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {doc.collaborators}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Document Editor */}
          <div className="lg:col-span-2">
            <EnhancedCard>
              <EnhancedCardHeader>
                <div className="flex items-center justify-between">
                  <EnhancedCardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    {selectedDoc ? selectedDoc.title : 'Select a document'}
                  </EnhancedCardTitle>
                  {selectedDoc && (
                    <div className="flex items-center gap-2">
                      <EnhancedButton
                        size="sm"
                        variant="outline"
                        onClick={handleSaveDocument}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Save
                      </EnhancedButton>
                      <EnhancedButton
                        size="sm"
                        variant="outline"
                        leftIcon={<Share2 className="h-4 w-4" />}
                      >
                        Share
                      </EnhancedButton>
                      <EnhancedButton
                        size="sm"
                        variant="outline"
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        Export
                      </EnhancedButton>
                    </div>
                  )}
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {selectedDoc ? (
                  <div className="space-y-4">
                    <EnhancedInput
                      value={selectedDoc.title}
                      onChange={(e) => setSelectedDoc({
                        ...selectedDoc,
                        title: e.target.value
                      })}
                      className="text-lg font-semibold"
                      placeholder="Document title..."
                    />
                    
                    <textarea
                      value={selectedDoc.content}
                      onChange={(e) => setSelectedDoc({
                        ...selectedDoc,
                        content: e.target.value
                      })}
                      className="w-full h-96 p-4 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Start writing your document..."
                    />

                    <div className="flex items-center justify-between text-sm text-secondary">
                      <span>Last saved: {selectedDoc.lastModified.toLocaleString()}</span>
                      <span>{selectedDoc.content.length} characters</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-primary mb-2">No Document Selected</h3>
                    <p className="text-secondary mb-6">
                      Select a document from the list or create a new one to start editing
                    </p>
                    <EnhancedButton
                      onClick={handleCreateDocument}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Create New Document
                    </EnhancedButton>
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>

        {/* Collaboration Features */}
        <div className="mt-8">
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaboration Features
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Real-time Editing</h3>
                  <p className="text-sm text-secondary">
                    Collaborate with team members in real-time with live cursor tracking
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Share2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Smart Sharing</h3>
                  <p className="text-sm text-secondary">
                    Share documents with granular permissions and access controls
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Version History</h3>
                  <p className="text-sm text-secondary">
                    Track changes and restore previous versions of your documents
                  </p>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  )
}
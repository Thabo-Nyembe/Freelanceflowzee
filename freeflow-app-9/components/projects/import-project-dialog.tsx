import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload,
  FileJson,
  FileSpreadsheet,
  FileArchive,
  Link,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface ImportProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: ImportData) => void
}

interface ImportData {
  source: string
  data: any
  type: string
}

const importSources = [
  {
    id: 'json',
    name: 'JSON File',
    description: 'Import project data from a JSON file',
    icon: FileJson,
    accepts: '.json',
    maxSize: '10MB'
  },
  {
    id: 'csv',
    name: 'CSV/Excel',
    description: 'Import from CSV or Excel spreadsheet',
    icon: FileSpreadsheet,
    accepts: '.csv,.xlsx,.xls',
    maxSize: '10MB'
  },
  {
    id: 'archive',
    name: 'Project Archive',
    description: 'Import from a project archive file',
    icon: FileArchive,
    accepts: '.zip,.tar.gz',
    maxSize: '100MB'
  },
  {
    id: 'url',
    name: 'External URL',
    description: 'Import from an external project URL',
    icon: Link,
    accepts: 'url',
    maxSize: 'N/A'
  }
]

export function ImportProjectDialog({ open, onOpenChange, onImport }: ImportProjectDialogProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleImport = async () => {
    try {
      setImporting(true)
      setError(null)

      // Simulate import progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 500)

      if (selectedSource === 'url' && url) {
        // Handle URL import
        const response = await fetch(url)
        const data = await response.json()
        onImport({ source: 'url', data, type: 'url' })
      } else if (file) {
        // Handle file import
        const reader = new FileReader()
        reader.onload = async (e) => {
          const content = e.target?.result
          if (typeof content === 'string') {
            const data = selectedSource === 'json' ? JSON.parse(content) : content
            onImport({ source: selectedSource || '', data, type: file.type })
          }
        }
        reader.readAsText(file)
      }

      // Cleanup
      setTimeout(() => {
        clearInterval(interval)
        setImporting(false)
        setProgress(0)
        onOpenChange(false)
      }, 3000)
    } catch (err) {
      setError('Failed to import project. Please check your file/URL and try again.')
      setImporting(false)
      setProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importSources.map(source => {
              const Icon = source.icon
              return (
                <Card
                  key={source.id}
                  className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                    selectedSource === source.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedSource(source.id)}
                  data-testid={`source-${source.id}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          Accepts: {source.accepts}
                        </Badge>
                        <Badge variant="outline">
                          Max: {source.maxSize}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {selectedSource && (
            <div className="space-y-4">
              {selectedSource === 'url' ? (
                <div className="space-y-2">
                  <Label htmlFor="url">Project URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    data-testid="url-input"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={importSources.find(s => s.id === selectedSource)?.accepts}
                    onChange={handleFileChange}
                    data-testid="file-input"
                  />
                </div>
              )}

              {importing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importing}
            data-testid="cancel-import-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || (!file && !url) || !selectedSource}
            data-testid="start-import-btn"
          >
            {importing ? (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 animate-bounce" />
                Importing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Start Import
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
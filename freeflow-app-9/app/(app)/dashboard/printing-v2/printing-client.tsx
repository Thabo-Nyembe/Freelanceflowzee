'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Printer, Plus, Search, FileText, Clock, CheckCircle, AlertTriangle, User } from 'lucide-react'

const printJobs = [
  { id: 1, document: 'Q1 Report.pdf', user: 'Sarah Chen', pages: 45, copies: 3, color: true, status: 'printing', printer: 'Office Printer A', submitted: '10:30 AM' },
  { id: 2, document: 'Marketing Brochure.pdf', user: 'Mike Johnson', pages: 8, copies: 50, color: true, status: 'queued', printer: 'Color Printer', submitted: '10:45 AM' },
  { id: 3, document: 'Meeting Notes.docx', user: 'Emily Davis', pages: 3, copies: 10, color: false, status: 'completed', printer: 'Office Printer B', submitted: '9:15 AM' },
  { id: 4, document: 'Training Manual.pdf', user: 'Tom Wilson', pages: 120, copies: 5, color: false, status: 'queued', printer: 'Office Printer A', submitted: '11:00 AM' },
]

const printers = [
  { id: 1, name: 'Office Printer A', location: '2nd Floor', type: 'B&W', status: 'online', paperLevel: 75, tonerLevel: 60, jobs: 2 },
  { id: 2, name: 'Office Printer B', location: '3rd Floor', type: 'B&W', status: 'online', paperLevel: 90, tonerLevel: 85, jobs: 0 },
  { id: 3, name: 'Color Printer', location: '1st Floor', type: 'Color', status: 'online', paperLevel: 45, tonerLevel: 30, jobs: 1 },
  { id: 4, name: 'Large Format Printer', location: 'Design Studio', type: 'Wide Format', status: 'offline', paperLevel: 0, tonerLevel: 0, jobs: 0 },
]

export default function PrintingClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalJobs: printJobs.length,
    activeJobs: printJobs.filter(j => j.status === 'printing' || j.status === 'queued').length,
    completed: printJobs.filter(j => j.status === 'completed').length,
    onlinePrinters: printers.filter(p => p.status === 'online').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      printing: 'bg-blue-100 text-blue-700',
      queued: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      online: 'bg-green-100 text-green-700',
      offline: 'bg-red-100 text-red-700',
      warning: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getPrinterStatus = (paperLevel: number, tonerLevel: number, status: string) => {
    if (status === 'offline') return 'offline'
    if (paperLevel < 20 || tonerLevel < 20) return 'warning'
    return 'online'
  }

  const insights = [
    { icon: Printer, title: `${stats.totalJobs}`, description: 'Total print jobs' },
    { icon: Clock, title: `${stats.activeJobs}`, description: 'In queue' },
    { icon: CheckCircle, title: `${stats.completed}`, description: 'Completed today' },
    { icon: AlertTriangle, title: `${stats.onlinePrinters}/${printers.length}`, description: 'Printers online' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Printer className="h-8 w-8 text-primary" />Print Services</h1>
          <p className="text-muted-foreground mt-1">Manage print jobs and printers</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Print Job</Button>
      </div>

      <CollapsibleInsightsPanel title="Printing Overview" insights={insights} defaultExpanded={true} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Print Queue</h3>
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {printJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{job.document}</h4>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.pages} pages × {job.copies} copies • {job.color ? 'Color' : 'B&W'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />{job.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Printer className="h-3 w-3" />{job.printer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{job.submitted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Printer Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {printers.map((printer) => {
            const printerStatus = getPrinterStatus(printer.paperLevel, printer.tonerLevel, printer.status)
            return (
              <Card key={printer.id} className={printerStatus === 'warning' ? 'border-yellow-200' : printerStatus === 'offline' ? 'border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{printer.name}</h4>
                      <p className="text-sm text-muted-foreground">{printer.location} • {printer.type}</p>
                    </div>
                    {getStatusBadge(printerStatus)}
                  </div>

                  {printer.status === 'online' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Paper</span>
                          <span>{printer.paperLevel}%</span>
                        </div>
                        <Progress value={printer.paperLevel} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Toner</span>
                          <span>{printer.tonerLevel}%</span>
                        </div>
                        <Progress value={printer.tonerLevel} className="h-2" />
                      </div>

                      <p className="text-sm text-muted-foreground">{printer.jobs} job(s) in queue</p>
                    </div>
                  )}

                  {printer.status === 'offline' && (
                    <p className="text-sm text-red-600">Printer is currently offline</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

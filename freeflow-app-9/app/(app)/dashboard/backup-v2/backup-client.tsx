'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { HardDrive, Cloud, Download, Upload, Clock, CheckCircle, AlertCircle, Play, RefreshCw, Trash2, MoreHorizontal, Calendar } from 'lucide-react'

const backups = [
  { id: 1, name: 'Full System Backup', type: 'full', size: '24.5 GB', date: '2024-01-15 02:00', status: 'completed', duration: '45 min' },
  { id: 2, name: 'Database Backup', type: 'database', size: '8.2 GB', date: '2024-01-15 01:00', status: 'completed', duration: '12 min' },
  { id: 3, name: 'Files Backup', type: 'files', size: '15.8 GB', date: '2024-01-14 02:00', status: 'completed', duration: '28 min' },
  { id: 4, name: 'Incremental Backup', type: 'incremental', size: '2.1 GB', date: '2024-01-14 14:00', status: 'completed', duration: '5 min' },
  { id: 5, name: 'Full System Backup', type: 'full', size: '24.3 GB', date: '2024-01-13 02:00', status: 'completed', duration: '43 min' },
]

export default function BackupClient() {
  const [autoBackup, setAutoBackup] = useState(true)

  const stats = useMemo(() => ({
    totalBackups: backups.length,
    totalSize: '75.9 GB',
    lastBackup: '2024-01-15 02:00',
    storageUsed: 45,
  }), [])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = { full: 'bg-blue-100 text-blue-700', database: 'bg-purple-100 text-purple-700', files: 'bg-green-100 text-green-700', incremental: 'bg-yellow-100 text-yellow-700' }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const insights = [
    { icon: HardDrive, title: `${stats.totalBackups}`, description: 'Total backups' },
    { icon: Cloud, title: stats.totalSize, description: 'Storage used' },
    { icon: CheckCircle, title: '100%', description: 'Success rate' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HardDrive className="h-8 w-8 text-primary" />
            Backup & Recovery
          </h1>
          <p className="text-muted-foreground mt-1">Manage system backups and data recovery</p>
        </div>
        <Button><Play className="h-4 w-4 mr-2" />Run Backup Now</Button>
      </div>

      <CollapsibleInsightsPanel title="Backup Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
            <CardDescription>Cloud backup storage allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Used: {stats.totalSize}</span>
                <span>Total: 200 GB</span>
              </div>
              <Progress value={stats.storageUsed} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>45% used</span>
                <span>110.1 GB available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Settings</CardTitle>
            <CardDescription>Configure automatic backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Auto Backup</p><p className="text-sm text-muted-foreground">Daily at 2:00 AM</p></div>
              <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Retention</p><p className="text-sm text-muted-foreground">Keep backups for 30 days</p></div>
              <Badge>30 days</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{backup.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={getTypeColor(backup.type)}>{backup.type}</Badge>
                      <span>{backup.size}</span>
                      <span>•</span>
                      <span>{backup.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{backup.date}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />{backup.status}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

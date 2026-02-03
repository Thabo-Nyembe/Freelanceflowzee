'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Shield, Plus, Search, Key, Lock, Unlock, Users, Clock, AlertTriangle } from 'lucide-react'

const accessCards = [
  { id: 1, employee: 'Sarah Chen', cardNumber: 'AC-1001', level: 'Executive', status: 'active', issued: '2024-01-10', lastUsed: '2024-02-03 8:30 AM' },
  { id: 2, employee: 'Mike Johnson', cardNumber: 'AC-1002', level: 'Employee', status: 'active', issued: '2024-01-15', lastUsed: '2024-02-03 9:15 AM' },
  { id: 3, employee: 'Emily Davis', cardNumber: 'AC-1003', level: 'Manager', status: 'active', issued: '2024-01-08', lastUsed: '2024-02-02 6:45 PM' },
  { id: 4, employee: 'Tom Wilson', cardNumber: 'AC-1004', level: 'Employee', status: 'suspended', issued: '2023-12-20', lastUsed: '2024-01-28 5:00 PM' },
]

const accessZones = [
  { id: 1, zone: 'Main Entrance', level: 'All', accessCount: 145, status: 'secure' },
  { id: 2, zone: 'Executive Floor', level: 'Executive', accessCount: 12, status: 'secure' },
  { id: 3, zone: 'Server Room', level: 'IT Staff', accessCount: 8, status: 'secure' },
  { id: 4, zone: 'Research Lab', level: 'R&D Team', accessCount: 15, status: 'unlocked' },
  { id: 5, zone: 'Parking Garage', level: 'All', accessCount: 98, status: 'secure' },
]

const recentActivity = [
  { id: 1, employee: 'Sarah Chen', zone: 'Executive Floor', action: 'Access Granted', time: '8:30 AM', date: '2024-02-03' },
  { id: 2, employee: 'Mike Johnson', zone: 'Main Entrance', action: 'Access Granted', time: '9:15 AM', date: '2024-02-03' },
  { id: 3, employee: 'Unknown Card', zone: 'Server Room', action: 'Access Denied', time: '10:00 AM', date: '2024-02-03' },
  { id: 4, employee: 'Emily Davis', zone: 'Parking Garage', action: 'Access Granted', time: '6:45 PM', date: '2024-02-02' },
]

const accessLevels = [
  { id: 1, level: 'Executive', description: 'Full building access', users: 8 },
  { id: 2, level: 'Manager', description: 'All floors except executive', users: 25 },
  { id: 3, level: 'Employee', description: 'Common areas and assigned floor', users: 180 },
  { id: 4, level: 'Visitor', description: 'Lobby and meeting rooms only', users: 5 },
  { id: 5, level: 'IT Staff', description: 'All floors plus server room', users: 12 },
]

export default function AccessControlClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalCards: accessCards.length,
    active: accessCards.filter(c => c.status === 'active').length,
    secureZones: accessZones.filter(z => z.status === 'secure').length,
    accessDenied: recentActivity.filter(a => a.action === 'Access Denied').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-700',
      secure: 'bg-green-100 text-green-700',
      unlocked: 'bg-yellow-100 text-yellow-700',
      alarm: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      'Access Granted': 'bg-green-100 text-green-700',
      'Access Denied': 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[action]}>{action}</Badge>
  }

  const insights = [
    { icon: Key, title: `${stats.totalCards}`, description: 'Access cards' },
    { icon: Users, title: `${stats.active}`, description: 'Active cards' },
    { icon: Lock, title: `${stats.secureZones}/${accessZones.length}`, description: 'Zones secure' },
    { icon: AlertTriangle, title: `${stats.accessDenied}`, description: 'Access denied today' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="h-8 w-8 text-primary" />Access Control</h1>
          <p className="text-muted-foreground mt-1">Manage building access and security</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Issue Card</Button>
      </div>

      <CollapsibleInsightsPanel title="Access Control Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">Access Cards</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="levels">Access Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search cards..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {accessCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{card.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{card.employee}</h4>
                        <p className="text-sm text-muted-foreground">Card: {card.cardNumber} • {card.level}</p>
                        <p className="text-xs text-muted-foreground">Last used: {card.lastUsed}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(card.status)}
                      <p className="text-xs text-muted-foreground mt-1">Issued: {card.issued}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessZones.map((zone) => (
              <Card key={zone.id} className={zone.status === 'unlocked' ? 'border-yellow-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{zone.zone}</h4>
                      <p className="text-sm text-muted-foreground">Required level: {zone.level}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {zone.status === 'secure' ? (
                        <Lock className="h-5 w-5 text-green-600" />
                      ) : (
                        <Unlock className="h-5 w-5 text-yellow-600" />
                      )}
                      {getStatusBadge(zone.status)}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Today's Access Count:</span>
                    <span className="font-medium">{zone.accessCount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{activity.employee}</h4>
                          {getActionBadge(activity.action)}
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.zone}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{activity.date}</p>
                        <p>{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessLevels.map((level) => (
              <Card key={level.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{level.level}</h4>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    <Badge variant="outline">{level.users} users</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

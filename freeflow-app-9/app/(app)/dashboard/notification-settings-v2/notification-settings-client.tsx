'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Bell, Mail, Smartphone, MessageSquare, Settings, Save,
  Volume2, VolumeX, Clock, Calendar, Shield, Users,
  DollarSign, Package, AlertTriangle, CheckCircle, Info,
  Zap, BellRing, BellOff, Globe, Monitor, Moon, Sun
} from 'lucide-react'

const notificationChannels = [
  { id: 'email', name: 'Email', icon: Mail, enabled: true, count: 245 },
  { id: 'push', name: 'Push Notifications', icon: Smartphone, enabled: true, count: 189 },
  { id: 'sms', name: 'SMS', icon: MessageSquare, enabled: false, count: 12 },
  { id: 'in-app', name: 'In-App', icon: Bell, enabled: true, count: 567 },
]

const notificationCategories = [
  {
    id: 'orders',
    name: 'Orders & Transactions',
    icon: Package,
    description: 'Order confirmations, payment updates, shipping notifications',
    settings: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
    }
  },
  {
    id: 'security',
    name: 'Security & Account',
    icon: Shield,
    description: 'Login alerts, password changes, security updates',
    settings: {
      email: true,
      push: true,
      sms: true,
      inApp: true,
    }
  },
  {
    id: 'marketing',
    name: 'Marketing & Promotions',
    icon: DollarSign,
    description: 'Sales, discounts, new products, newsletters',
    settings: {
      email: true,
      push: false,
      sms: false,
      inApp: false,
    }
  },
  {
    id: 'social',
    name: 'Social & Community',
    icon: Users,
    description: 'Comments, mentions, follows, messages',
    settings: {
      email: false,
      push: true,
      sms: false,
      inApp: true,
    }
  },
  {
    id: 'system',
    name: 'System & Updates',
    icon: Settings,
    description: 'App updates, maintenance, feature announcements',
    settings: {
      email: true,
      push: false,
      sms: false,
      inApp: true,
    }
  },
]

const schedulePresets = [
  { id: 'always', name: 'Always On', description: 'Receive notifications anytime' },
  { id: 'business', name: 'Business Hours', description: 'Mon-Fri, 9 AM - 6 PM' },
  { id: 'custom', name: 'Custom Schedule', description: 'Set your own quiet hours' },
]

export default function NotificationSettingsClient() {
  const [activeTab, setActiveTab] = useState('channels')
  const [categories, setCategories] = useState(notificationCategories)
  const [channels, setChannels] = useState(notificationChannels)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [schedulePreset, setSchedulePreset] = useState('always')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [badgeCount, setBadgeCount] = useState(true)

  const stats = useMemo(() => ({
    enabledChannels: channels.filter(c => c.enabled).length,
    totalNotifications: channels.reduce((sum, c) => sum + c.count, 0),
    activeCategories: categories.filter(c => Object.values(c.settings).some(v => v)).length,
  }), [channels, categories])

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(c =>
      c.id === channelId ? { ...c, enabled: !c.enabled } : c
    ))
  }

  const toggleCategorySetting = (categoryId: string, channel: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, settings: { ...cat.settings, [channel]: !cat.settings[channel as keyof typeof cat.settings] } }
        : cat
    ))
  }

  const insights = [
    { icon: Bell, title: `${stats.enabledChannels}/${channels.length}`, description: 'Active channels' },
    { icon: BellRing, title: `${stats.totalNotifications}`, description: 'Sent this week' },
    { icon: CheckCircle, title: `${stats.activeCategories}`, description: 'Categories enabled' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage how and when you receive notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BellOff className="h-4 w-4 mr-2" />
            Mute All
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Notification Overview"
        insights={insights}
        defaultExpanded={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        channel.enabled
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <channel.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{channel.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {channel.count} notifications this week
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Channel Priority</CardTitle>
              <CardDescription>
                Set the order of preference for notifications when multiple channels are enabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {channels.filter(c => c.enabled).map((channel, idx) => (
                  <div key={channel.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <span className="text-muted-foreground font-mono">#{idx + 1}</span>
                    <channel.icon className="h-4 w-4" />
                    <span>{channel.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Email</span>
                        </div>
                        <Switch
                          checked={category.settings.email}
                          onCheckedChange={() => toggleCategorySetting(category.id, 'email')}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Push</span>
                        </div>
                        <Switch
                          checked={category.settings.push}
                          onCheckedChange={() => toggleCategorySetting(category.id, 'push')}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">SMS</span>
                        </div>
                        <Switch
                          checked={category.settings.sms}
                          onCheckedChange={() => toggleCategorySetting(category.id, 'sms')}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">In-App</span>
                        </div>
                        <Switch
                          checked={category.settings.inApp}
                          onCheckedChange={() => toggleCategorySetting(category.id, 'inApp')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Schedule</CardTitle>
                <CardDescription>Choose when you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedulePresets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      schedulePreset === preset.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSchedulePreset(preset.id)}
                  >
                    <div>
                      <p className="font-medium">{preset.name}</p>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 ${
                      schedulePreset === preset.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Quiet Hours
                </CardTitle>
                <CardDescription>Pause notifications during specific times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Quiet Hours</p>
                    <p className="text-sm text-muted-foreground">Silence non-urgent notifications</p>
                  </div>
                  <Switch
                    checked={quietHoursEnabled}
                    onCheckedChange={setQuietHoursEnabled}
                  />
                </div>
                {quietHoursEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Start Time</label>
                        <Select defaultValue="22:00">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20:00">8:00 PM</SelectItem>
                            <SelectItem value="21:00">9:00 PM</SelectItem>
                            <SelectItem value="22:00">10:00 PM</SelectItem>
                            <SelectItem value="23:00">11:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">End Time</label>
                        <Select defaultValue="07:00">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="06:00">6:00 AM</SelectItem>
                            <SelectItem value="07:00">7:00 AM</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Allow Security Alerts</p>
                        <p className="text-xs text-muted-foreground">Critical security notifications will bypass quiet hours</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sound & Vibration</CardTitle>
                <CardDescription>Control notification alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">Notification Sounds</p>
                      <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                    </div>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
                {soundEnabled && (
                  <div className="pl-8 space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sound Volume</label>
                      <Slider defaultValue={[70]} max={100} step={10} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notification Sound</label>
                      <Select defaultValue="default">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="chime">Chime</SelectItem>
                          <SelectItem value="bell">Bell</SelectItem>
                          <SelectItem value="pop">Pop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Vibration</p>
                      <p className="text-sm text-muted-foreground">Vibrate on notifications</p>
                    </div>
                  </div>
                  <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Display Settings</CardTitle>
                <CardDescription>Customize how notifications appear</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Badge Count</p>
                    <p className="text-sm text-muted-foreground">Show unread count on app icon</p>
                  </div>
                  <Switch checked={badgeCount} onCheckedChange={setBadgeCount} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Preview Content</p>
                    <p className="text-sm text-muted-foreground">Show message preview in notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Group Notifications</p>
                    <p className="text-sm text-muted-foreground">Combine similar notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium mb-2 block">Notification Position</label>
                  <Select defaultValue="top-right">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

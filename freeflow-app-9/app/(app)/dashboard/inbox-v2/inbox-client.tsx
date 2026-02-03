'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Inbox, Mail, Star, Archive, Trash2, Search, Plus,
  Reply, Forward, MoreHorizontal, Paperclip, Clock,
  CheckCircle, AlertCircle, Tag, Filter, RefreshCw,
  Send, ArrowLeft, CornerUpLeft
} from 'lucide-react'

const emails = [
  {
    id: 1,
    from: 'Sarah Chen',
    email: 'sarah@company.com',
    subject: 'Project Update - Q1 Deliverables',
    preview: 'Hi team, I wanted to share an update on our Q1 progress. We\'ve completed...',
    date: '10:30 AM',
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    labels: ['work', 'important']
  },
  {
    id: 2,
    from: 'Mike Johnson',
    email: 'mike@client.io',
    subject: 'Re: Contract Discussion',
    preview: 'Thanks for sending over the revised contract. I have a few questions about...',
    date: '9:15 AM',
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    labels: ['client']
  },
  {
    id: 3,
    from: 'Newsletter',
    email: 'news@techweekly.com',
    subject: 'This Week in Tech: AI Updates',
    preview: 'The latest developments in artificial intelligence and machine learning...',
    date: 'Yesterday',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['newsletter']
  },
  {
    id: 4,
    from: 'Emily Davis',
    email: 'emily@design.co',
    subject: 'Design Assets Ready for Review',
    preview: 'The new brand assets are ready! Please review the attached files and...',
    date: 'Yesterday',
    isRead: true,
    isStarred: true,
    hasAttachment: true,
    labels: ['design', 'review']
  },
  {
    id: 5,
    from: 'Support Team',
    email: 'support@service.com',
    subject: 'Ticket #1234 Resolved',
    preview: 'Your support ticket has been resolved. If you have any further questions...',
    date: 'Jan 14',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['support']
  },
  {
    id: 6,
    from: 'Tom Wilson',
    email: 'tom@startup.co',
    subject: 'Meeting Tomorrow at 3 PM',
    preview: 'Reminder: We have a meeting scheduled for tomorrow at 3 PM to discuss...',
    date: 'Jan 14',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['meeting']
  },
]

export default function InboxClient() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  const [selectedEmail, setSelectedEmail] = useState<typeof emails[0] | null>(null)

  const stats = useMemo(() => ({
    unread: emails.filter(e => !e.isRead).length,
    starred: emails.filter(e => e.isStarred).length,
    total: emails.length,
  }), [])

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           email.preview.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'inbox' ||
                        (activeTab === 'starred' && email.isStarred) ||
                        (activeTab === 'unread' && !email.isRead)
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  const toggleSelect = (id: number) => {
    setSelectedEmails(prev =>
      prev.includes(id)
        ? prev.filter(e => e !== id)
        : [...prev, id]
    )
  }

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-100 text-blue-700',
      important: 'bg-red-100 text-red-700',
      client: 'bg-green-100 text-green-700',
      newsletter: 'bg-purple-100 text-purple-700',
      design: 'bg-pink-100 text-pink-700',
      review: 'bg-yellow-100 text-yellow-700',
      support: 'bg-gray-100 text-gray-700',
      meeting: 'bg-orange-100 text-orange-700',
    }
    return colors[label] || 'bg-gray-100 text-gray-700'
  }

  const insights = [
    { icon: Mail, title: `${stats.unread}`, description: 'Unread emails' },
    { icon: Star, title: `${stats.starred}`, description: 'Starred' },
    { icon: Inbox, title: `${stats.total}`, description: 'Total emails' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Inbox className="h-8 w-8 text-primary" />
            Inbox
          </h1>
          <p className="text-muted-foreground mt-1">Manage your messages and communications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Email Stats"
        insights={insights}
        defaultExpanded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    <TabsTrigger value="starred">Starred</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !email.isRead ? 'bg-primary/5' : ''
                    } ${selectedEmail?.id === email.id ? 'bg-primary/10' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <Checkbox
                      checked={selectedEmails.includes(email.id)}
                      onCheckedChange={() => toggleSelect(email.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="text-muted-foreground hover:text-yellow-500"
                    >
                      <Star className={`h-4 w-4 ${email.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                          {email.from}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{email.date}</span>
                      </div>
                      <p className={`text-sm truncate ${!email.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{email.preview}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {email.hasAttachment && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                        {email.labels.slice(0, 2).map(label => (
                          <Badge key={label} variant="secondary" className={`text-xs ${getLabelColor(label)}`}>
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedEmail ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Forward className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{selectedEmail.subject}</h2>
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar>
                        <AvatarFallback>{selectedEmail.from.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedEmail.from}</span>
                          <span className="text-sm text-muted-foreground">&lt;{selectedEmail.email}&gt;</span>
                        </div>
                        <span className="text-sm text-muted-foreground">to me</span>
                      </div>
                      <span className="ml-auto text-sm text-muted-foreground">{selectedEmail.date}</span>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <p>Hi,</p>
                    <p>{selectedEmail.preview}</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                    <p>Best regards,<br />{selectedEmail.from}</p>
                  </div>

                  {selectedEmail.hasAttachment && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Attachments (2)
                      </h4>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-medium">PDF</div>
                          <span className="text-sm">document.pdf</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <div className="h-8 w-8 bg-green-100 rounded flex items-center justify-center text-green-600 text-xs font-medium">XLS</div>
                          <span className="text-sm">data.xlsx</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <CornerUpLeft className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an email</h3>
                <p className="text-muted-foreground">Choose an email from the list to view its contents</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

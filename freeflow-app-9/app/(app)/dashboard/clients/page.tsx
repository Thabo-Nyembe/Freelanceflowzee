/* ------------------------------------------------------------------
 * Clients – CRM-style management module (placeholder implementation)
 * ------------------------------------------------------------------ */
'use client'

import { useState } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Star,
  Briefcase,
  DollarSign,
} from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

// ------------------------------------------------------------------//
// mocked client dataset – replace with real API later
// ------------------------------------------------------------------//
const clients = [
  {
    id: 'CL-001',
    name: 'Alex Johnson',
    company: 'Johnson Media',
    email: 'alex@jm.com',
    phone: '+1 555-1234',
    location: 'New York, USA',
    projects: 6,
    totalSpend: 12800,
    rating: 5,
    status: 'vip',
  },
  {
    id: 'CL-002',
    name: 'Maria Garcia',
    company: 'Garcia Studios',
    email: 'maria@garciastudios.es',
    phone: '+34 600-98-765',
    location: 'Madrid, ES',
    projects: 3,
    totalSpend: 5600,
    rating: 4,
    status: 'active',
  },
  {
    id: 'CL-003',
    name: 'David Lee',
    company: 'Lee & Co.',
    email: 'david@lee.co',
    phone: '+27 82-555-4321',
    location: 'Cape Town, ZA',
    projects: 1,
    totalSpend: 1500,
    rating: 4,
    status: 'lead',
  },
] as const

// badge colour helper
const statusColour: Record<string, string> = {
  vip: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  lead: 'bg-blue-100 text-blue-800',
}

export default function ClientsPage() {
  const [query, setQuery] = useState('')

  // Handlers
  const handleAddClient = () => { console.log('➕ ADD'); alert('➕ Add Client') }
  const handleViewClient = (id: string) => { console.log('👁️:', id); alert(`👁️ View ${id}`) }
  const handleEditClient = (id: string) => { console.log('✏️:', id); alert(`✏️ Edit ${id}`) }
  const handleDeleteClient = (id: string) => { console.log('🗑️:', id); confirm('Delete client?') && alert('✅ Deleted') }
  const handleSendMessage = (id: string) => { console.log('💬:', id); alert(`💬 Message ${id}`) }
  const handleSendEmail = (id: string) => { console.log('📧:', id); alert(`📧 Email ${id}`) }
  const handleCallClient = (id: string) => { console.log('📞:', id); alert(`📞 Call ${id}`) }
  const handleViewProjects = (id: string) => { console.log('📁:', id); alert(`📁 Projects ${id}`) }
  const handleAddProject = (id: string) => { console.log('➕📁:', id); alert(`➕ Add Project ${id}`) }
  const handleUpgradeToVIP = (id: string) => { console.log('⭐:', id); alert(`⭐ VIP ${id}`) }
  const handleChangeStatus = (id: string, status: string) => { console.log('🔄:', id, status); alert(`🔄 ${status}`) }
  const handleExportClients = () => { console.log('💾 EXP'); alert('💾 Export') }
  const handleImportClients = () => { console.log('📥 IMP'); alert('📥 Import') }
  const handleBulkAction = (action: string) => { console.log('☑️:', action); alert(`☑️ ${action}`) }
  const handleFilterStatus = (status: string) => { console.log('🔍:', status); alert(`🔍 Filter ${status}`) }
  const handleSortClients = (by: string) => { console.log('🔃:', by); alert(`🔃 Sort ${by}`) }
  const handleViewAnalytics = (id: string) => { console.log('📊:', id); alert(`📊 Analytics ${id}`) }
  const handleSendInvoice = (id: string) => { console.log('💰:', id); alert(`💰 Invoice ${id}`) }
  const handleScheduleMeeting = (id: string) => { console.log('📅:', id); alert(`📅 Meeting ${id}`) }
  const handleViewHistory = (id: string) => { console.log('📜:', id); alert(`📜 History ${id}`) }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.company.toLowerCase().includes(query.toLowerCase())
  )

  /* ---------- stats ---------- */
  const stats = {
    total: clients.length,
    vip: clients.filter((c) => c.status === 'vip').length,
    active: clients.filter((c) => c.status === 'active').length,
    leads: clients.filter((c) => c.status === 'lead').length,
  }

  return (
    <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-bolt/10 dark:bg-violet-bolt/20">
              <Users className="h-6 w-6 kazi-text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
                Clients
              </h1>
              <p className="text-muted-foreground text-sm">
                Relationship & project management
              </p>
            </div>
          </div>

          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="container mx-auto px-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Total Clients</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-xs text-muted-foreground">VIP</p>
              <p className="text-xl font-semibold">{stats.vip}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-semibold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Leads</p>
              <p className="text-xl font-semibold">{stats.leads}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & filter */}
      <div className="container mx-auto px-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Client grid */}
      <div className="container mx-auto px-4 pb-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((c) => (
          <Card key={c.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="flex items-start gap-3 pb-1">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {c.location}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Remove Client</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* contact */}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{c.phone}</span>
              </div>

              {/* stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {c.projects} projects
                </div>
                <div className="inline-flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${c.totalSpend.toLocaleString()}
                </div>
              </div>

              {/* rating & status */}
              <div className="flex items-center gap-2">
                {[...Array(c.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                ))}
                <Badge className={statusColour[c.status]}>{c.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

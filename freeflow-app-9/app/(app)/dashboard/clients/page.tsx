/* ------------------------------------------------------------------
 * Clients – CRM-style management module (placeholder implementation)
 * ------------------------------------------------------------------ */
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
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
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'

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
  const handleAddClient = () => {
    console.log('✨ CLIENTS: Add client action initiated')
    console.log('📝 CLIENTS: Opening add client form')
    toast.success('✨ Add Client', {
      description: 'Client form will open here'
    })
  }

  const handleViewClient = (id: string) => {
    console.log('✨ CLIENTS: View client action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📋 CLIENTS: Opening client profile view')
    toast.info('👁️ View Client', {
      description: 'Opening profile for ' + id
    })
  }

  const handleEditClient = (id: string) => {
    console.log('✨ CLIENTS: Edit client action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📋 CLIENTS: Opening client edit form')
    toast.info('✏️ Edit Client', {
      description: 'Opening edit form for ' + id
    })
  }

  const handleDeleteClient = (id: string) => {
    console.log('✨ CLIENTS: Delete client action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    if (confirm('Delete client?')) {
      console.log('✅ CLIENTS: Client deletion confirmed')
      console.log('📋 CLIENTS: Removing client from database')
      toast.success('✅ Client Deleted', {
        description: 'Client ' + id + ' has been removed'
      })
    }
  }

  const handleSendMessage = (id: string) => {
    console.log('✨ CLIENTS: Send message action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('💬 CLIENTS: Opening messaging interface')
    toast.success('💬 Message Client', {
      description: 'Opening chat with ' + id
    })
  }

  const handleSendEmail = (id: string) => {
    console.log('✨ CLIENTS: Send email action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📧 CLIENTS: Opening email composer')
    toast.success('📧 Email Client', {
      description: 'Opening email for ' + id
    })
  }

  const handleCallClient = (id: string) => {
    console.log('✨ CLIENTS: Call client action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📞 CLIENTS: Initiating phone call')
    toast.info('📞 Call Client', {
      description: 'Calling ' + id
    })
  }

  const handleViewProjects = (id: string) => {
    console.log('✨ CLIENTS: View projects action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📁 CLIENTS: Loading client projects')
    toast.info('📁 View Projects', {
      description: 'Loading projects for ' + id
    })
  }

  const handleAddProject = (id: string) => {
    console.log('✨ CLIENTS: Add project action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('➕ CLIENTS: Opening new project form')
    toast.success('➕ Add Project', {
      description: 'Creating new project for ' + id
    })
  }

  const handleUpgradeToVIP = (id: string) => {
    console.log('✨ CLIENTS: Upgrade to VIP action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('⭐ CLIENTS: Upgrading client status to VIP')
    toast.success('⭐ Upgraded to VIP', {
      description: 'Client ' + id + ' is now VIP'
    })
  }

  const handleChangeStatus = (id: string, status: string) => {
    console.log('✨ CLIENTS: Change status action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📝 CLIENTS: New status: ' + status)
    console.log('🔄 CLIENTS: Updating client status')
    toast.success('🔄 Status Updated', {
      description: 'Changed to ' + status
    })
  }

  const handleExportClients = () => {
    console.log('✨ CLIENTS: Export clients action initiated')
    console.log('💾 CLIENTS: Preparing client data export')
    console.log('📊 CLIENTS: Generating CSV file')
    toast.success('💾 Export Started', {
      description: 'Downloading client list'
    })
  }

  const handleImportClients = () => {
    console.log('✨ CLIENTS: Import clients action initiated')
    console.log('📥 CLIENTS: Opening file import dialog')
    console.log('📋 CLIENTS: Ready to process CSV/Excel')
    toast.info('📥 Import Clients', {
      description: 'Select a file to import'
    })
  }

  const handleBulkAction = (action: string) => {
    console.log('✨ CLIENTS: Bulk action initiated')
    console.log('📝 CLIENTS: Action type: ' + action)
    console.log('☑️ CLIENTS: Processing selected clients')
    toast.success('☑️ Bulk Action', {
      description: 'Executing ' + action
    })
  }

  const handleFilterStatus = (status: string) => {
    console.log('✨ CLIENTS: Filter status action initiated')
    console.log('📝 CLIENTS: Filter by: ' + status)
    console.log('🔍 CLIENTS: Applying status filter')
    toast.info('🔍 Filter Applied', {
      description: 'Showing ' + status + ' clients'
    })
  }

  const handleSortClients = (by: string) => {
    console.log('✨ CLIENTS: Sort clients action initiated')
    console.log('📝 CLIENTS: Sort by: ' + by)
    console.log('🔃 CLIENTS: Reordering client list')
    toast.info('🔃 Sort Applied', {
      description: 'Sorted by ' + by
    })
  }

  const handleViewAnalytics = (id: string) => {
    console.log('✨ CLIENTS: View analytics action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📊 CLIENTS: Loading analytics dashboard')
    toast.info('📊 View Analytics', {
      description: 'Loading stats for ' + id
    })
  }

  const handleSendInvoice = (id: string) => {
    console.log('✨ CLIENTS: Send invoice action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('💰 CLIENTS: Generating invoice')
    toast.success('💰 Invoice Sent', {
      description: 'Invoice sent to ' + id
    })
  }

  const handleScheduleMeeting = (id: string) => {
    console.log('✨ CLIENTS: Schedule meeting action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📅 CLIENTS: Opening calendar scheduler')
    toast.info('📅 Schedule Meeting', {
      description: 'Calendar opening for ' + id
    })
  }

  const handleViewHistory = (id: string) => {
    console.log('✨ CLIENTS: View history action initiated')
    console.log('📝 CLIENTS: Client ID: ' + id)
    console.log('📜 CLIENTS: Loading interaction history')
    toast.info('📜 View History', {
      description: 'Loading history for ' + id
    })
  }

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
    <div className="min-h-screen bg-slate-950 py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <TextShimmer className="text-3xl font-bold" duration={2}>
                Clients
              </TextShimmer>
              <p className="text-gray-400 text-sm">
                Relationship & project management
              </p>
            </div>
          </div>

          <Button onClick={handleAddClient} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="container mx-auto px-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiquidGlassCard>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Total Clients</p>
              <p className="text-xl font-semibold text-white"><NumberFlow value={stats.total} /></p>
            </div>
          </CardContent>
        </LiquidGlassCard>
        <LiquidGlassCard>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">VIP</p>
              <p className="text-xl font-semibold text-white"><NumberFlow value={stats.vip} /></p>
            </div>
          </CardContent>
        </LiquidGlassCard>
        <LiquidGlassCard>
          <CardContent className="p-4 flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-semibold">{stats.active}</p>
            </div>
          </CardContent>
        </LiquidGlassCard>
        <LiquidGlassCard>
          <CardContent className="p-4 flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Leads</p>
              <p className="text-xl font-semibold">{stats.leads}</p>
            </div>
          </CardContent>
        </LiquidGlassCard>
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
        <Button onClick={() => handleFilterStatus('all')} variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Client grid */}
      <div className="container mx-auto px-4 pb-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((c) => (
          <LiquidGlassCard key={c.id} className="group hover:shadow-lg transition-shadow">
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
                  <DropdownMenuItem onClick={() => handleViewClient(c.id)}>View Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendMessage(c.id)}>Send Message</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteClient(c.id)} className="text-red-600">Remove Client</DropdownMenuItem>
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
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )
}

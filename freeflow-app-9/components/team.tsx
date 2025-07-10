"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  Shield,
  Star,
  UserPlus,
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  avatar?: string
  status: 'active' | 'away' | 'offline'
  isAdmin?: boolean
  isFavorite?: boolean
  department: string
  joinedDate: string
}

interface TeamProps {
  members: TeamMember[]
  onInviteMember?: () => void
  onContactMember?: (memberId: string, method: 'email' | 'chat' | 'phone') => void
  onToggleFavorite?: (memberId: string) => void
  onToggleAdmin?: (memberId: string) => void
}

const statusColors = {
  active: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-500',
}

export default function Team({
  members,
  onInviteMember,
  onContactMember,
  onToggleFavorite,
  onToggleAdmin,
}: TeamProps) {
  const sortedMembers = [...members].sort((a, b) => {
    // Sort by admin status first
    if (a.isAdmin && !b.isAdmin) return -1
    if (!a.isAdmin && b.isAdmin) return 1
    // Then by favorite status
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    // Then by online status
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    // Finally by name
    return a.name.localeCompare(b.name)
  })

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">
            {members.length} members ({members.filter((m) => m.status === 'active').length} active)
          </p>
        </div>
        <Button onClick={onInviteMember}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="space-y-4">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                    statusColors[member.status]
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{member.name}</h3>
                  {member.isAdmin && (
                    <Badge variant="outline" className="text-blue-500">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {member.isFavorite && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <p className="text-xs text-muted-foreground">
                  {member.department} • Joined {new Date(member.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onContactMember?.(member.id, 'email')}
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onContactMember?.(member.id, 'chat')}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              {member.phone && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onContactMember?.(member.id, 'phone')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onToggleFavorite?.(member.id)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {member.isFavorite ? 'Remove from' : 'Add to'} favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleAdmin?.(member.id)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {member.isAdmin ? 'Remove' : 'Make'} admin
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

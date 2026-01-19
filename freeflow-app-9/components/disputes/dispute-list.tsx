/**
 * Dispute List Component - FreeFlow A+++ Implementation
 * Browse and filter disputes
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Scale,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDisputes,
  type Dispute,
  type DisputeStatus,
  getDisputeStatusColor,
  getDisputeStatusLabel,
  getDisputeTypeLabel,
} from '@/lib/hooks/use-disputes';

interface DisputeListProps {
  showFilters?: boolean;
  defaultRole?: 'initiator' | 'respondent' | 'all';
}

export function DisputeList({
  showFilters = true,
  defaultRole = 'all',
}: DisputeListProps) {
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<'initiator' | 'respondent' | 'all'>(defaultRole);
  const [searchQuery, setSearchQuery] = useState('');

  const { disputes, isLoading, stats } = useDisputes({
    status: statusFilter === 'all' ? undefined : statusFilter,
    role: roleFilter === 'all' ? undefined : roleFilter,
  });

  // Filter by search query
  const filteredDisputes = disputes.filter((dispute) =>
    dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispute.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: DisputeStatus) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'mediation':
      case 'escalated':
        return <Scale className="h-4 w-4 text-orange-500" />;
      case 'response_pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Disputes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-muted-foreground">Urgent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.byStatus.resolved || 0}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search disputes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as DisputeStatus | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="response_pending">Awaiting Response</SelectItem>
                  <SelectItem value="in_discussion">In Discussion</SelectItem>
                  <SelectItem value="evidence_review">Evidence Review</SelectItem>
                  <SelectItem value="mediation">In Mediation</SelectItem>
                  <SelectItem value="resolution_proposed">Resolution Proposed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="initiator">I Opened</SelectItem>
                  <SelectItem value="respondent">Against Me</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispute List */}
      {filteredDisputes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Disputes Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You have no disputes at this time'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} />
          ))}
        </div>
      )}
    </div>
  );
}

function DisputeCard({ dispute }: { dispute: Dispute }) {
  const otherParty = dispute.buyer_is_initiator
    ? dispute.respondent
    : dispute.initiator;

  return (
    <Link href={`/dashboard/disputes/${dispute.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Order Image */}
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {dispute.order?.listing?.images?.[0] ? (
                <img
                  src={dispute.order.listing.images[0]}
                  alt={dispute.order.listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FileText className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate">{dispute.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {dispute.description}
                  </p>
                </div>
                <Badge className={getDisputeStatusColor(dispute.status)}>
                  {getDisputeStatusLabel(dispute.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <Badge variant="outline">{getDisputeTypeLabel(dispute.dispute_type)}</Badge>
                <span className="text-sm font-medium">
                  ${dispute.disputed_amount.toFixed(2)} {dispute.currency}
                </span>
                {dispute.priority !== 'normal' && (
                  <Badge
                    variant={dispute.priority === 'urgent' ? 'destructive' : 'secondary'}
                  >
                    {dispute.priority}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={otherParty?.avatar_url} />
                      <AvatarFallback>
                        {otherParty?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{otherParty?.name || 'Unknown'}</span>
                  </div>
                  {dispute.messages && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{(dispute.messages as unknown[]).length || 0}</span>
                    </div>
                  )}
                  {dispute.evidence && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{(dispute.evidence as unknown[]).length || 0}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(dispute.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* Deadlines */}
              {dispute.response_deadline &&
                dispute.status === 'response_pending' && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Response due:{' '}
                      {format(new Date(dispute.response_deadline), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default DisputeList;

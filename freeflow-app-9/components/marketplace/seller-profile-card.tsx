'use client';

/**
 * Seller Profile Card - FreeFlow A+++ Implementation
 * Display seller information with stats and badges
 */

import Link from 'next/link';
import {
  Star,
  Clock,
  Globe,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Award,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SellerProfile, SELLER_LEVELS } from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';

interface SellerProfileCardProps {
  seller: SellerProfile;
  variant?: 'compact' | 'full';
  showContactButton?: boolean;
  onContact?: () => void;
}

export function SellerProfileCard({
  seller,
  variant = 'compact',
  showContactButton = true,
  onContact,
}: SellerProfileCardProps) {
  const levelInfo = SELLER_LEVELS[seller.level];
  const memberSince = new Date(seller.joined_at || seller.created_at);
  const lastActive = seller.last_active_at ? new Date(seller.last_active_at) : null;

  // Format response time
  const formatResponseTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  // Check if online (active in last 10 minutes)
  const isOnline = lastActive && Date.now() - lastActive.getTime() < 10 * 60 * 1000;

  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={seller.profile_image || ''} />
                <AvatarFallback className="text-xl">
                  {seller.display_name?.[0] || 'S'}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/sellers/${seller.user_id}`}
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {seller.display_name}
                </Link>
                <Badge variant="outline" className="text-xs">
                  {levelInfo.label}
                </Badge>
                {seller.is_pro && (
                  <Badge className="bg-green-500 text-xs">PRO</Badge>
                )}
                {seller.is_verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>Verified Seller</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {seller.tagline && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {seller.tagline}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{seller.average_rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({seller.total_reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{seller.response_rate}% response</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          {showContactButton && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={onContact}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Me
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card>
      {/* Cover Image */}
      {seller.cover_image && (
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative">
          <img
            src={seller.cover_image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className={cn('p-6', seller.cover_image && '-mt-12')}>
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className={cn('h-24 w-24 border-4 border-background', seller.cover_image && 'ring-2 ring-background')}>
              <AvatarImage src={seller.profile_image || ''} />
              <AvatarFallback className="text-3xl">
                {seller.display_name?.[0] || 'S'}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-bold">{seller.display_name}</h2>
              <Badge variant="outline">{levelInfo.label}</Badge>
              {seller.is_pro && <Badge className="bg-green-500">PRO</Badge>}
              {seller.is_verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Shield className="h-5 w-5 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>Identity Verified</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {seller.tagline && (
              <p className="text-muted-foreground">{seller.tagline}</p>
            )}

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{seller.average_rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({seller.total_reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member since {memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {seller.bio && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{seller.bio}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{seller.completed_orders}</p>
            <p className="text-xs text-muted-foreground">Orders Completed</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{seller.on_time_delivery_rate}%</p>
            <p className="text-xs text-muted-foreground">On-Time Delivery</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{seller.response_rate}%</p>
            <p className="text-xs text-muted-foreground">Response Rate</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{formatResponseTime(seller.response_time)}</p>
            <p className="text-xs text-muted-foreground">Avg. Response</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Level Progress</span>
            <span className="font-medium">{seller.level_progress}%</span>
          </div>
          <Progress value={seller.level_progress} className="h-2" />
        </div>

        {/* Languages */}
        {seller.languages && seller.languages.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {seller.languages.map((lang, i) => (
                <Badge key={i} variant="secondary">
                  {lang.name} - {lang.level}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {seller.skills && seller.skills.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {seller.skills.map((skill, i) => (
                <Badge key={i} variant="outline">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {seller.certifications && seller.certifications.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifications
            </h3>
            <div className="space-y-2">
              {seller.certifications.map((cert, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <span className="text-muted-foreground">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Button */}
        {showContactButton && (
          <Button className="w-full mt-6" onClick={onContact}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Seller
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

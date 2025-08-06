"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, TrendingUp, Star, Search, ArrowRight, Globe } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Community Hub
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Connect with creators, share your work, and find inspiration
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">2,847</p>
              <p className="text-xs text-muted-foreground">Active Creators</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <MessageCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">15.2k</p>
              <p className="text-xs text-muted-foreground">Discussions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Star className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">42.8k</p>
              <p className="text-xs text-muted-foreground">Project Shares</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">95%</p>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="text-center py-12">
        <CardHeader>
          <CardTitle className="text-2xl mb-4">Enhanced Community Features Coming Soon</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            We&apos;re building an amazing community experience with creator marketplace, 
            social feeds, collaboration tools, and much more. Stay tuned!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button className="gap-2">
              Join Waitlist
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Creator Profiles</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Social Feed</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Search className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Smart Search</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Star className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Portfolio Showcase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
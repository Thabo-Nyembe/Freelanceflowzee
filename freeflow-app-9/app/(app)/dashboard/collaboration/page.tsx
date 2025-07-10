"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Users, 
  Video, 
  Mic, 
  Share2, 
  FileText, 
  Image, 
  Play, 
  PinIcon,
  CheckCircle
} from "lucide-react";

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Universal Collaboration Hub
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Revolutionary multi-media commenting, real-time collaboration, and AI-powered feedback analysis 
          with live cursor tracking, voice notes, and instant synchronization across all project types.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Enhanced Chat</TabsTrigger>
          <TabsTrigger value="feedback">Pinpoint Feedback</TabsTrigger>
          <TabsTrigger value="media">Media Preview</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Enhanced Collaboration Chat
              </CardTitle>
              <CardDescription>
                Real-time messaging with audio/video calls and file sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">3 participants</span>
                  </div>
                  <Badge variant="secondary">Audio Call Ready</Badge>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mic className="h-4 w-4 mr-2" />
                      Audio Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      S
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm">The latest design mockups look great! I especially like the color scheme.</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Sarah • 2 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      M
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm">Added some pinpoint feedback on the homepage layout. Check it out!</p>
                        <Badge variant="outline" className="mt-2">
                          <PinIcon className="h-3 w-3 mr-1" />
                          Image Comment
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Mike • 5 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PinIcon className="h-5 w-5" />
                Universal Pinpoint Feedback
              </CardTitle>
              <CardDescription>
                Add precise feedback on images, videos, PDFs, and code files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">Supported Media Types</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg text-center">
                      <Image className="h-6 w-6 mx-auto mb-2 text-blue-600" alt="Images icon" />
                      <p className="text-sm">Images</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <Play className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm">Videos</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm">PDFs</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <Mic className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm">Audio</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Feedback</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Logo positioning</p>
                        <p className="text-xs text-gray-500">on homepage-mockup.png</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">open</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Color adjustments</p>
                        <p className="text-xs text-gray-500">on brand-video.mp4</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        resolved
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Preview Demo</CardTitle>
              <CardDescription>
                Interactive preview system for all media types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="h-8 w-8 text-white" alt="Media preview icon" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Enhanced Media Preview</h3>
                <p className="text-gray-600 mb-6">Coming soon with advanced preview capabilities</p>
                <Button>
                  <Share2 className="h-4 w-4 mr-2" />
                  View Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canvas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Canvas</CardTitle>
              <CardDescription>
                Figma-style collaborative design canvas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Collaborative Canvas</h3>
                <p className="text-gray-600 mb-6">Real-time design collaboration with live cursors</p>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Start Collaboration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

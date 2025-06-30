import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Play, FileText, Mic, Code, Camera } from "lucide-react";

export default function MediaPreviewDemoPage() {
  const mediaTypes = [
    { icon: Image, name: "Images", description: "JPG, PNG, GIF, SVG", color: "bg-blue-100 text-blue-700" },
    { icon: Play, name: "Videos", description: "MP4, MOV, AVI, WEBM", color: "bg-green-100 text-green-700" },
    { icon: FileText, name: "Documents", description: "PDF, DOC, TXT", color: "bg-purple-100 text-purple-700" },
    { icon: Mic, name: "Audio", description: "MP3, WAV, OGG", color: "bg-orange-100 text-orange-700" },
    { icon: Code, name: "Code", description: "JS, TS, CSS, HTML", color: "bg-red-100 text-red-700" },
    { icon: Camera, name: "Screenshots", description: "Design mockups", color: "bg-pink-100 text-pink-700" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Universal Media Preview System</h1>
          <p className="text-xl text-gray-600">
            Interactive preview and commenting system for all media types
          </p>
          <Badge variant="secondary" className="mt-4">Demo Version</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {mediaTypes.map((media, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${media.color}`}>
                    <media.icon className="h-6 w-6" />
                  </div>
                  {media.name}
                </CardTitle>
                <CardDescription>{media.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Preview Sample
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Enhanced Preview System</CardTitle>
            <CardDescription>
              Complete media preview system with pinpoint commenting, real-time collaboration, 
              and AI-powered analysis coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="mr-4">
              Request Early Access
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
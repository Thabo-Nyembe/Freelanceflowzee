import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Share, Eye, Plus, Grid, List } from "lucide-react"

export function Gallery() {
  const projects = [
    { id: 1, title: "Brand Identity Collection", type: "Branding", images: 12, status: "Public", views: 1240 },
    { id: 2, title: "Website Design Showcase", type: "Web Design", images: 8, status: "Private", views: 0 },
    { id: 3, title: "Product Photography", type: "Photography", images: 24, status: "Client Access", views: 856 },
    { id: 4, title: "Logo Design Portfolio", type: "Branding", images: 16, status: "Public", views: 2100 },
    { id: 5, title: "Mobile App Designs", type: "UI/UX", images: 20, status: "Public", views: 1680 },
    { id: 6, title: "Print Design Collection", type: "Print", images: 14, status: "Private", views: 0 },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Portfolio Gallery</h2>
          <p className="text-lg text-slate-500 mt-1">Showcase your creative work</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            <Share className="h-4 w-4 mr-2" />
            Share Portfolio
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Upload Project
          </Button>
        </div>
      </div>

      {/* Gallery Stats */}
      <div className="grid grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-light text-blue-800 mb-1">24</p>
            <p className="text-sm text-blue-600">Total Projects</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-light text-emerald-800 mb-1">156</p>
            <p className="text-sm text-emerald-600">Total Images</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-light text-purple-800 mb-1">12.4k</p>
            <p className="text-sm text-purple-600">Total Views</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-light text-amber-800 mb-1">18</p>
            <p className="text-sm text-amber-600">Public Projects</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-light text-rose-800 mb-1">4.8</p>
            <p className="text-sm text-rose-600">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search projects, tags, or categories..."
                  className="pl-10 bg-white/70 border-slate-200"
                />
              </div>
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-600">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-600">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Grid */}
      <div className="grid grid-cols-3 gap-8">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300 group"
          >
            <CardContent className="p-6">
              {/* Project Preview */}
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    project.id % 4 === 0
                      ? "from-purple-500/20 to-pink-500/20"
                      : project.id % 3 === 0
                        ? "from-blue-500/20 to-indigo-500/20"
                        : project.id % 2 === 0
                          ? "from-emerald-500/20 to-teal-500/20"
                          : "from-amber-500/20 to-orange-500/20"
                  }`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">{project.title}</h4>
                    <p className="text-sm text-slate-500">
                      {project.type} • {project.images} images
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      project.status === "Public"
                        ? "bg-emerald-100 text-emerald-700"
                        : project.status === "Private"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{project.views.toLocaleString()} views</span>
                  <span>Updated 2 days ago</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
          Load More Projects
        </Button>
      </div>
    </div>
  )
}

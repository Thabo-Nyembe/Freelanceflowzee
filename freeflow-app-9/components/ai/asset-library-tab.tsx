"use client"

import { useState } from 'react'
import { Search, Upload, Download, Star, StarOff, File, Code, Image, Video, Music } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'code' | 'document'
  size: string
  dateCreated: Date
  favorite: boolean
}

interface AssetLibraryTabProps {
  assets: Asset[]
  onExportAll: () => void
}

const getAssetIcon = (type: Asset['type']) => {
  switch (type) {
    case 'image':
      return Image
    case 'video':
      return Video
    case 'audio':
      return Music
    case 'code':
      return Code
    case 'document':
      return File
    default:
      return File
  }
}

export function AssetLibraryTab({ assets: unknown, onExportAll }: AssetLibraryTabProps) {
  const [searchQuery, setSearchQuery] = useState<any>('')

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Handle file upload logic
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="asset-search-input"
          />
        </div>
        <div className="flex space-x-2">
          <div>
            <input
              type="file"
              id="asset-upload"
              className="hidden"
              onChange={handleFileChange}
              data-testid="asset-upload-input"
            />
            <Button
              onClick={() => document.getElementById('asset-upload')?.click()}
              data-testid="upload-asset-btn"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Asset
            </Button>
          </div>
          <Button
            onClick={onExportAll}
            data-testid="export-all-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const Icon = getAssetIcon(asset.type)
            return (
              <Card key={asset.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-gray-400" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    data-testid={`favorite-${asset.id}-btn`}
                  >
                    {asset.favorite ? (
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{asset.name}</h3>
                      <p className="text-sm text-gray-500">
                        {asset.dateCreated.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>{asset.size}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {asset.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                      data-testid={`download-${asset.id}-btn`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
} 
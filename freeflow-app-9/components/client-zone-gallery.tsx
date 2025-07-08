'use client'

import { useReducer } from 'react'
import { 
  Lock, Unlock, Download, Heart, Eye, CheckCircle, XCircle, Clock, Grid, List, Search,
  CreditCard, ShieldCheck, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { AnimatePresence, motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'

// Type Definitions
interface ImageAsset {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  previewUrl?: string;
  width: number;
  height: number;
  size: string;
  format: string;
  tags: string[];
  isFavorited: boolean;
  downloadCount: number;
  viewCount: number;
  uploadedAt: string;
}

interface VideoAsset {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  size: string;
  format: string;
  tags: string[];
  isFavorited: boolean;
  downloadCount: number;
  viewCount: number;
  uploadedAt: string;
}

interface ClientGallery {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  clientCompany: string;
  coverImage: string;
  status: 'locked' | 'unlocked' | 'pending';
  escrowStatus: 'pending' | 'funded' | 'partially_released' | 'fully_released';
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  expiresAt: string;
  downloadPassword?: string;
  watermarkEnabled: boolean;
  downloadLimit?: number;
  analytics: {
    totalViews: number;
    totalDownloads: number;
    totalFavorites: number;
    uniqueVisitors: number;
    lastAccessed?: string;
  };
  unlockMethods: {
    type: 'payment' | 'escrow_release' | 'password';
    isEnabled: boolean;
    amount?: number;
    password?: string;
  }[];
  images: ImageAsset[];
  videos: VideoAsset[];
}

interface ClientGalleryState {
  galleries: ClientGallery[];
  selectedGallery: ClientGallery | null;
  viewMode: 'grid' | 'list';
  filterStatus: 'all' | 'locked' | 'unlocked' | 'pending';
  searchQuery: string;
  lightboxOpen: boolean;
  lightboxIndex: number;
  paymentModalOpen: boolean;
  loading: boolean;
  error: string | null;
}

type ClientGalleryAction =
  | { type: 'SET_GALLERIES'; payload: ClientGallery[] }
  | { type: 'SELECT_GALLERY'; payload: ClientGallery | null }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_FILTER_STATUS'; payload: 'all' | 'locked' | 'unlocked' | 'pending' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_LIGHTBOX'; payload: { open: boolean; index?: number } }
  | { type: 'TOGGLE_PAYMENT_MODAL'; payload: boolean }
  | { type: 'UNLOCK_GALLERY'; payload: string }
  | { type: 'FAVORITE_ITEM'; payload: { galleryId: string; itemId: string; type: 'image' | 'video' } }
  | { type: 'INCREMENT_VIEWS'; payload: { galleryId: string; itemId: string; type: 'image' | 'video' } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Mock data
const mockGalleries: ClientGallery[] = [
  {
    id: 'gallery_001',
    title: 'Wedding Photography Collection',
    description: 'Beautiful moments from Sarah & Mike\'s special day',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@example.com',
    clientAvatar: '/avatars/sarah.jpg',
    clientCompany: 'Johnson Family',
    coverImage: '/images/wedding-cover.jpg',
    status: 'unlocked',
    escrowStatus: 'fully_released',
    totalAmount: 2500,
    paidAmount: 2500,
    createdAt: '2024-02-01',
    expiresAt: '2024-12-31',
    downloadPassword: 'WEDDING2024!',
    watermarkEnabled: false,
    downloadLimit: 100,
    analytics: {
      totalViews: 234,
      totalDownloads: 45,
      totalFavorites: 67,
      uniqueVisitors: 23,
      lastAccessed: '2024-02-15T14:30:00Z'
    },
    unlockMethods: [
      { type: 'escrow_release', isEnabled: true },
      { type: 'password', isEnabled: true, password: 'WEDDING2024!' }
    ],
    images: [
      {
        id: 'img_001',
        name: 'First Kiss',
        url: '/images/wedding-1.jpg',
        thumbnailUrl: '/images/wedding-1-thumb.jpg',
        width: 4000,
        height: 6000,
        size: '12.5 MB',
        format: 'RAW',
        tags: ['ceremony', 'kiss', 'romantic'],
        isFavorited: true,
        downloadCount: 8,
        viewCount: 45,
        uploadedAt: '2024-02-01T14:30:00Z'
      }
    ],
    videos: [
      {
        id: 'vid_001',
        name: 'Wedding Highlights',
        url: '/videos/wedding-highlights.mp4',
        thumbnailUrl: '/images/video-thumb.jpg',
        duration: 180,
        size: '245 MB',
        format: '4K MP4',
        tags: ['highlights', 'cinematic'],
        isFavorited: false,
        downloadCount: 5,
        viewCount: 89,
        uploadedAt: '2024-02-01T21:00:00Z'
      }
    ]
  },
  {
    id: 'gallery_002',
    title: 'Brand Identity Package',
    description: 'Complete brand identity for Acme Corporation',
    clientName: 'John Smith',
    clientEmail: 'john@acme.com',
    clientAvatar: '/avatars/john.jpg',
    clientCompany: 'Acme Corporation',
    coverImage: '/images/brand-cover.jpg',
    status: 'locked',
    escrowStatus: 'funded',
    totalAmount: 5000,
    paidAmount: 2500,
    createdAt: '2024-02-10',
    expiresAt: '2024-06-30',
    watermarkEnabled: true,
    analytics: {
      totalViews: 45,
      totalDownloads: 0,
      totalFavorites: 12,
      uniqueVisitors: 8
    },
    unlockMethods: [
      { type: 'payment', isEnabled: true, amount: 2500 },
      { type: 'escrow_release', isEnabled: true }
    ],
    images: [
      {
        id: 'img_002',
        name: 'Logo Design',
        url: '/images/logo-preview.jpg',
        thumbnailUrl: '/images/logo-thumb.jpg',
        previewUrl: '/images/logo-watermark.jpg',
        width: 2000,
        height: 2000,
        size: '8.2 MB',
        format: 'PNG',
        tags: ['logo', 'branding'],
        isFavorited: false,
        downloadCount: 0,
        viewCount: 23,
        uploadedAt: '2024-02-10T10:00:00Z'
      }
    ],
    videos: []
  }
]

// Reducer function following Context7 patterns
function clientGalleryReducer(state: ClientGalleryState, action: ClientGalleryAction): ClientGalleryState {
  switch (action.type) {
    case 'SET_GALLERIES':
      return { ...state, galleries: action.payload }
    
    case 'SELECT_GALLERY':
      return { ...state, selectedGallery: action.payload }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'TOGGLE_LIGHTBOX':
      return { 
        ...state, 
        lightboxOpen: action.payload.open,
        lightboxIndex: action.payload.index || 0
      }
    
    case 'TOGGLE_PAYMENT_MODAL':
      return { ...state, paymentModalOpen: action.payload }
    
    case 'UNLOCK_GALLERY':
      return {
        ...state,
        galleries: state.galleries.map(gallery =>
          gallery.id === action.payload
            ? { ...gallery, status: 'unlocked' as const }
            : gallery
        )
      }
    
    case 'FAVORITE_ITEM':
      return {
        ...state,
        galleries: state.galleries.map(gallery =>
          gallery.id === action.payload.galleryId
            ? {
                ...gallery,
                [action.payload.type === 'image' ? 'images' : 'videos']: 
                  gallery[action.payload.type === 'image' ? 'images' : 'videos'].map((item: ImageAsset | VideoAsset) =>
                    item.id === action.payload.itemId
                      ? { ...item, isFavorited: !item.isFavorited }
                      : item
                  )
              }
            : gallery
        )
      }
    
    case 'INCREMENT_VIEWS':
      return {
        ...state,
        galleries: state.galleries.map(gallery =>
          gallery.id === action.payload.galleryId
            ? {
                ...gallery,
                [action.payload.type === 'image' ? 'images' : 'videos']: 
                  gallery[action.payload.type === 'image' ? 'images' : 'videos'].map((item: ImageAsset | VideoAsset) =>
                    item.id === action.payload.itemId
                      ? { ...item, viewCount: item.viewCount + 1 }
                      : item
                  )
              }
            : gallery
        )
      }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
      
    case 'SET_ERROR':
      return { ...state, error: action.payload }

    default:
      return state
  }
}

export default function ClientZoneGallery() {
    const [state, dispatch] = useReducer(clientGalleryReducer, {
        galleries: mockGalleries,
        selectedGallery: null,
        viewMode: 'grid',
        filterStatus: 'all',
        searchQuery: '',
        lightboxOpen: false,
        lightboxIndex: 0,
        paymentModalOpen: false,
        loading: false,
        error: null,
    })

    const filteredGalleries = state.galleries.filter(gallery => {
        const statusMatch = state.filterStatus === 'all' || gallery.status === state.filterStatus
        const searchMatch = state.searchQuery === '' || gallery.title.toLowerCase().includes(state.searchQuery.toLowerCase())
        return statusMatch && searchMatch
    })

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto py-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">Client Galleries</h1>
                        <p className="text-slate-500">Your secure client portal</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search galleries..."
                            value={state.searchQuery}
                            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                            className="pl-10 bg-white/70 border-slate-200"
                        />
                    </div>
                </header>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        {(['all', 'unlocked', 'locked', 'pending'] as const).map((status) => (
                            <Button
                                key={status}
                                size="sm"
                                variant={state.filterStatus === status ? 'default' : 'outline'}
                                onClick={() => dispatch({ type: 'SET_FILTER_STATUS', payload: status })}
                                className="capitalize"
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={state.viewMode === 'list' ? 'default' : 'outline'}
                            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    <motion.div
                        layout
                        className={state.viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}
                    >
                        {filteredGalleries.map((gallery) => (
                            <motion.div layout key={gallery.id}>
                                <Card className="group bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="relative aspect-video overflow-hidden">
                                        <Image
                                            src={gallery.coverImage}
                                            alt={gallery.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {gallery.status === 'locked' && (
                                            <div className="absolute inset-0 bg-purple-100/80 flex items-center justify-center">
                                                <div className="text-center p-4 bg-white/80 rounded-lg shadow-lg">
                                                    <Lock className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                                                    <h3 className="font-bold text-lg text-purple-800">Gallery Locked</h3>
                                                    <p className="text-sm text-purple-700">
                                                        Pay ${gallery.totalAmount - gallery.paidAmount} to unlock
                                                    </p>
                                                    <Progress
                                                        value={(gallery.paidAmount / gallery.totalAmount) * 100}
                                                        className="h-2"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
} 
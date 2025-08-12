'use client'

import FilesHub from '@/components/hubs/files-hub'

// Mock data for the FilesHub component
const mockFiles = [
  {
    id: '1',
    name: 'Project Proposal.pdf',
    type: 'document' as const,
    size: 2457600, // 2.4 MB in bytes
    url: '/files/project-proposal.pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: {
      id: 'user1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    shared: true,
    starred: true,
    downloads: 15,
    views: 42,
    folder: 'Documents',
    tags: ['proposal', 'client', 'project']
  },
  {
    id: '2',
    name: 'Design Mockups.fig',
    type: 'other' as const,
    size: 15925248, // 15.2 MB
    url: '/files/design-mockups.fig',
    uploadedAt: '2024-01-14T15:45:00Z',
    uploadedBy: {
      id: 'user2',
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg'
    },
    shared: false,
    starred: false,
    downloads: 8,
    views: 23,
    folder: 'Designs',
    tags: ['design', 'figma', 'mockup']
  },
  {
    id: '3',
    name: 'Team Photo.jpg',
    type: 'image' as const,
    size: 3981312, // 3.8 MB
    url: '/files/team-photo.jpg',
    thumbnailUrl: '/files/thumbs/team-photo-thumb.jpg',
    uploadedAt: '2024-01-12T09:20:00Z',
    uploadedBy: {
      id: 'user3',
      name: 'Mike Johnson',
      avatar: '/avatars/mike.jpg'
    },
    shared: true,
    starred: false,
    downloads: 25,
    views: 67,
    folder: 'Images',
    tags: ['team', 'photo', 'company']
  },
  {
    id: '4',
    name: 'Presentation.pptx',
    type: 'document' as const,
    size: 9125888, // 8.7 MB
    url: '/files/presentation.pptx',
    uploadedAt: '2024-01-10T14:15:00Z',
    uploadedBy: {
      id: 'user1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    shared: false,
    starred: true,
    downloads: 12,
    views: 34,
    folder: 'Documents',
    tags: ['presentation', 'powerpoint', 'slides']
  },
  {
    id: '5',
    name: 'Demo Video.mp4',
    type: 'video' as const,
    size: 52428800, // 50 MB
    url: '/files/demo-video.mp4',
    thumbnailUrl: '/files/thumbs/demo-video-thumb.jpg',
    uploadedAt: '2024-01-08T11:30:00Z',
    uploadedBy: {
      id: 'user2',
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg'
    },
    shared: true,
    starred: true,
    downloads: 18,
    views: 89,
    folder: 'Videos',
    tags: ['demo', 'video', 'presentation']
  }
]

export default function FilesHubPage() {
  return (
    <div className="h-full">
      <FilesHub userId="current-user" files={mockFiles} />
    </div>
  )
}
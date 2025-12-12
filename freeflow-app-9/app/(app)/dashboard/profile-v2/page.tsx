"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  User,
  Edit,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  Award,
  Star,
  Users,
  Shield,
  MessageSquare,
  Settings,
  Share2,
  Download,
  Plus
} from 'lucide-react'

/**
 * Profile V2 - Groundbreaking Professional Profile
 * Showcases user portfolio with modern components
 */
export default function ProfileV2() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'experience' | 'portfolio'>('overview')

  // Mock user profile data
  const userProfile = {
    name: 'Sarah Johnson',
    title: 'Lead UI/UX Designer',
    company: 'Creative Solutions Inc.',
    location: 'San Francisco, CA',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    website: 'sarahdesigns.com',
    bio: 'Passionate UI/UX designer with 8+ years of experience creating beautiful, user-centered digital experiences. Specialized in design systems, mobile apps, and web applications.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    joinDate: '2023-01-15',
    verified: true,
    rating: 4.9,
    reviews: 127,
    followers: 1247,
    projects: 89
  }

  const stats = [
    { label: 'Projects Completed', value: '89', change: 12.5, icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Client Rating', value: '4.9', change: 5.2, icon: <Star className="w-5 h-5" /> },
    { label: 'Total Reviews', value: '127', change: 15.3, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Followers', value: '1.2K', change: 8.7, icon: <Users className="w-5 h-5" /> }
  ]

  const skills = [
    { name: 'UI/UX Design', level: 'Expert', years: 8 },
    { name: 'Figma', level: 'Expert', years: 5 },
    { name: 'Adobe Creative Suite', level: 'Expert', years: 10 },
    { name: 'Sketch', level: 'Advanced', years: 6 },
    { name: 'Prototyping', level: 'Expert', years: 7 },
    { name: 'User Research', level: 'Advanced', years: 4 },
    { name: 'Design Systems', level: 'Expert', years: 5 },
    { name: 'Frontend Development', level: 'Intermediate', years: 3 }
  ]

  const experience = [
    {
      company: 'Creative Solutions Inc.',
      position: 'Lead UI/UX Designer',
      duration: '2023 - Present',
      description: 'Leading design team and creating user-centered digital experiences for enterprise clients.'
    },
    {
      company: 'Design Studio Pro',
      position: 'Senior UI/UX Designer',
      duration: '2020 - 2023',
      description: 'Designed mobile apps and web applications for various clients, focusing on user experience optimization.'
    },
    {
      company: 'Tech Startup XYZ',
      position: 'UI/UX Designer',
      duration: '2018 - 2020',
      description: 'Worked on product design and user interface development for a fast-growing SaaS platform.'
    }
  ]

  const recentProjects = [
    {
      id: 1,
      name: 'E-commerce Mobile App',
      client: 'Retail Giant',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop',
      likes: 156,
      views: 2840
    },
    {
      id: 2,
      name: 'Banking Dashboard',
      client: 'Financial Services',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop',
      likes: 203,
      views: 3250
    },
    {
      id: 3,
      name: 'Healthcare Platform',
      client: 'MedTech Solutions',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=150&fit=crop',
      likes: 89,
      views: 1620
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/30 to-teal-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <User className="w-10 h-10 text-blue-600" />
              Profile
            </h1>
            <p className="text-muted-foreground">Manage your professional profile and portfolio</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <IconButton icon={<Share2 />} ariaLabel="Share" variant="ghost" size="md" />
            <GradientButton from="blue" to="cyan" onClick={() => console.log('Edit profile')}>
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        {/* Profile Header Card */}
        <BentoCard className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group mb-4">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-32 h-32 rounded-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                {userProfile.verified && (
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-2">{userProfile.title}</p>
              <p className="text-muted-foreground mb-4">{userProfile.company}</p>
              <p className="text-muted-foreground leading-relaxed mb-4">{userProfile.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {userProfile.location}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {userProfile.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {userProfile.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {userProfile.website}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {userProfile.joinDate}
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <PillButton variant={selectedTab === 'overview' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('overview')}>
            <User className="w-4 h-4 mr-2" />
            Overview
          </PillButton>
          <PillButton variant={selectedTab === 'skills' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('skills')}>
            <Award className="w-4 h-4 mr-2" />
            Skills
          </PillButton>
          <PillButton variant={selectedTab === 'experience' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('experience')}>
            <Briefcase className="w-4 h-4 mr-2" />
            Experience
          </PillButton>
          <PillButton variant={selectedTab === 'portfolio' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('portfolio')}>
            <Star className="w-4 h-4 mr-2" />
            Portfolio
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {selectedTab === 'overview' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">About</h3>
                <p className="text-muted-foreground leading-relaxed">{userProfile.bio}</p>
              </BentoCard>
            )}

            {selectedTab === 'skills' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Skills & Expertise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border bg-background">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{skill.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-md ${
                          skill.level === 'Expert' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' :
                          skill.level === 'Advanced' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                          'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {skill.level}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{skill.years} years experience</p>
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}

            {selectedTab === 'experience' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
                <div className="space-y-6">
                  {experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold">{exp.position}</h4>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground mb-2">{exp.duration}</p>
                      <p className="text-sm text-muted-foreground">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}

            {selectedTab === 'portfolio' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="rounded-lg border border-border overflow-hidden group cursor-pointer">
                      <div className="relative">
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-1">{project.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{project.client}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {project.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <BentoQuickAction icon={<Edit />} title="Edit Profile" description="Update info" onClick={() => console.log('Edit')} />
              <BentoQuickAction icon={<Plus />} title="Add Project" description="Portfolio" onClick={() => console.log('Add')} />
              <BentoQuickAction icon={<Download />} title="Export CV" description="PDF format" onClick={() => console.log('Export')} />
            </div>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Profile Views" value="2,847" change={12.5} />
                <MiniKPI label="Response Rate" value="98%" change={5.2} />
                <MiniKPI label="Avg Response Time" value="2.4h" change={-15.2} />
                <MiniKPI label="Profile Completeness" value="85%" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}

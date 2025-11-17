"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Settings, 
  Edit, 
  Camera, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe,
  Briefcase,
  Award,
  BookOpen,
  Star,
  TrendingUp,
  Users,
  FileText,
  Link,
  Shield,
  Bell,
  Eye,
  Download,
  Share2,
  Heart,
  MessageSquare
} from 'lucide-react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<any>('overview')
  const [isEditing, setIsEditing] = useState<any>(false)

  // Handlers
  const handleEditProfile = () => { console.log('✏️ EDIT'); setIsEditing(true); alert('✏️ Edit Profile') }
  const handleSaveProfile = () => { console.log('💾 SAVE'); setIsEditing(false); alert('💾 Saved') }
  const handleCancelEdit = () => { console.log('❌ CANCEL'); setIsEditing(false) }
  const handleUploadAvatar = () => { console.log('📷 AVATAR'); const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.click(); alert('📷 Upload avatar') }
  const handleUpdateBio = () => { console.log('📝 BIO'); alert('📝 Update bio') }
  const handleAddSkill = () => { console.log('➕ SKILL'); const skill = prompt('Add skill:'); skill && alert(`➕ Added: ${skill}`) }
  const handleRemoveSkill = (skill: string) => { console.log('➖ SKILL:', skill); confirm(`Remove ${skill}?`) && alert('✅ Removed') }
  const handleAddSocial = () => { console.log('🔗 SOCIAL'); alert('🔗 Add social link') }
  const handleUpdatePassword = () => { console.log('🔒 PASSWORD'); alert('🔒 Update password') }
  const handleUpdateEmail = () => { console.log('📧 EMAIL'); alert('📧 Update email') }
  const handleUpdatePhone = () => { console.log('📱 PHONE'); alert('📱 Update phone') }
  const handleUpdateLocation = () => { console.log('📍 LOCATION'); alert('📍 Update location') }
  const handlePrivacySettings = () => { console.log('🔒 PRIVACY'); alert('🔒 Privacy settings') }
  const handleNotificationPrefs = () => { console.log('🔔 NOTIF'); alert('🔔 Notification preferences') }
  const handleDeleteAccount = () => { console.log('🗑️ DELETE'); confirm('Delete account? This cannot be undone!') && alert('Account deletion requested') }
  const handleExportData = () => { console.log('💾 EXPORT'); alert('💾 Exporting your data...') }
  const handleViewActivity = () => { console.log('📊 ACTIVITY'); alert('📊 Activity log') }
  const handleConnectedApps = () => { console.log('🔌 APPS'); alert('🔌 Connected apps') }
  const handleTwoFactorAuth = () => { console.log('🔐 2FA'); alert('🔐 Two-factor authentication') }
  const handleSessionManagement = () => { console.log('🖥️ SESSIONS'); alert('🖥️ Active sessions') }

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
    lastActive: '2024-01-15',
    verified: true,
    rating: 4.9,
    reviews: 127,
    followers: 1247,
    following: 324,
    projects: 89,
    skills: [
      { name: 'UI/UX Design', level: 'Expert', years: 8 },
      { name: 'Figma', level: 'Expert', years: 5 },
      { name: 'Adobe Creative Suite', level: 'Expert', years: 10 },
      { name: 'Sketch', level: 'Advanced', years: 6 },
      { name: 'Prototyping', level: 'Expert', years: 7 },
      { name: 'User Research', level: 'Advanced', years: 4 },
      { name: 'Design Systems', level: 'Expert', years: 5 },
      { name: 'Frontend Development', level: 'Intermediate', years: 3 }
    ],
    experience: [
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
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'Master of Design',
        duration: '2016 - 2018',
        description: 'Specialized in Human-Computer Interaction and User Experience Design'
      },
      {
        institution: 'California College of the Arts',
        degree: 'Bachelor of Fine Arts',
        duration: '2012 - 2016',
        description: 'Focused on Graphic Design and Visual Communication'
      }
    ],
    achievements: [
      {
        title: 'Design Excellence Award',
        organization: 'UX Design Association',
        year: '2023',
        description: 'Recognized for outstanding contributions to user experience design'
      },
      {
        title: 'Top 50 Designers',
        organization: 'Design Weekly',
        year: '2022',
        description: 'Featured in the annual list of top 50 designers to watch'
      },
      {
        title: 'Innovation Award',
        organization: 'Tech Innovation Summit',
        year: '2021',
        description: 'Awarded for innovative approach to mobile app design'
      }
    ],
    recentProjects: [
      {
        id: 1,
        name: 'E-commerce Mobile App',
        client: 'Retail Giant',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop',
        likes: 156,
        views: 2840,
        date: '2024-01-10'
      },
      {
        id: 2,
        name: 'Banking Dashboard',
        client: 'Financial Services',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop',
        likes: 203,
        views: 3250,
        date: '2024-01-05'
      },
      {
        id: 3,
        name: 'Healthcare Platform',
        client: 'MedTech Solutions',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=150&fit=crop',
        likes: 89,
        views: 1620,
        date: '2023-12-28'
      }
    ]
  }

  const stats = [
    { label: 'Projects Completed', value: userProfile.projects, icon: Briefcase },
    { label: 'Client Rating', value: userProfile.rating, icon: Star },
    { label: 'Total Reviews', value: userProfile.reviews, icon: MessageSquare },
    { label: 'Followers', value: userProfile.followers, icon: Users }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your professional profile and portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
          <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback className="text-2xl">{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                  {userProfile.verified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-2">{userProfile.title}</p>
                <p className="text-gray-500 mb-4">{userProfile.company}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {userProfile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {userProfile.joinDate}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => {
                  const IconComponent = stat.icon
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <IconComponent className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
              <p className="text-gray-600 leading-relaxed">{userProfile.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {userProfile.email}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {userProfile.phone}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Globe className="h-4 w-4" />
                  {userProfile.website}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{userProfile.bio}</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profile Views</span>
                      <span className="font-semibold">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active</span>
                      <span className="font-semibold">{userProfile.lastActive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Rate</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="font-semibold">2 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>Professional skills and competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.skills.map((skill, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{skill.name}</h3>
                      <Badge className={`${
                        skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                        skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {skill.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{skill.years} years experience</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userProfile.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold">{exp.position}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                      <p className="text-sm text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userProfile.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500 mb-2">{edu.duration}</p>
                      <p className="text-sm text-gray-600">{edu.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Showcase of recent work and projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfile.recentProjects.map((project) => (
                  <Card key={project.id} className="kazi-card overflow-hidden group cursor-pointer">
                    <div className="relative">
                      <img 
                        src={project.thumbnail} 
                        alt={project.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{project.client}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{project.date}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {project.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.views}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Awards & Recognition</CardTitle>
              <CardDescription>Professional achievements and awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userProfile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-gray-600">{achievement.organization}</p>
                      <p className="text-sm text-gray-500 mb-2">{achievement.year}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

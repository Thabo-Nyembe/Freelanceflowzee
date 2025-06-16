'use client'

import { useState } from 'react'
import { User, Settings, Camera, Mail, Phone, MapPin, Calendar, Star, Badge, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge as BadgeComponent } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Sarah Johnson',
    email: 'sarah@freeflowzee.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Creative designer with 8+ years of experience in branding and digital design. Passionate about creating meaningful user experiences.',
    website: 'https://sarahdesigns.com',
    linkedin: 'linkedin.com/in/sarahjohnson',
    twitter: '@sarahdesigns',
    joinDate: 'January 2023',
    avatar: null
  })

  const [achievements] = useState([
    { name: 'Top Performer', description: '5-star average rating', icon: '⭐', earned: true },
    { name: 'Quick Deliverer', description: 'Delivered 50+ projects on time', icon: '⚡', earned: true },
    { name: 'Client Favorite', description: '95% client satisfaction rate', icon: '💝', earned: true },
    { name: 'Innovation Award', description: 'Most creative project of the month', icon: '🏆', earned: false }
  ])

  const [stats] = useState({
    projectsCompleted: 47,
    totalEarnings: 85600,
    clientSatisfaction: 4.9,
    responseTime: '2 hours'
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    projectAlerts: true,
    paymentNotifications: true,
    marketingEmails: false,
    pushNotifications: true
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={profile.avatar ?? undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{profile.name}</h3>
                <p className="text-gray-600">Creative Designer</p>
                <div className="flex items-center justify-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{stats.clientSatisfaction}</span>
                  <span className="text-sm text-gray-500 ml-1">({stats.projectsCompleted} reviews)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Projects Completed</span>
                <span className="font-medium">{stats.projectsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-medium">${stats.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Response Time</span>
                <span className="font-medium">{stats.responseTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">{profile.joinDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${achievement.earned ? 'text-green-900' : 'text-gray-500'}`}>
                        {achievement.name}
                      </p>
                      <p className={`text-sm ${achievement.earned ? 'text-green-700' : 'text-gray-400'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <BadgeComponent className="bg-green-100 text-green-800">
                        Earned
                      </BadgeComponent>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={profile.bio} 
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Manage your professional profiles and portfolio links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="website">Website/Portfolio</Label>
                    <Input id="website" value={profile.website} onChange={(e) => setProfile({...profile, website: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input id="linkedin" value={profile.linkedin} onChange={(e) => setProfile({...profile, linkedin: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label htmlFor="twitter">Twitter/X Handle</Label>
                    <Input id="twitter" value={profile.twitter} onChange={(e) => setProfile({...profile, twitter: e.target.value})} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>Add your skills to help clients find you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['UI/UX Design', 'Branding', 'Logo Design', 'Web Design', 'Mobile Design', 'Prototyping'].map((skill) => (
                      <BadgeComponent key={skill} variant="secondary">
                        {skill}
                      </BadgeComponent>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    Add Skill
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Updates</p>
                      <p className="text-sm text-gray-500">Receive important updates via email</p>
                    </div>
                    <Switch 
                      checked={notifications.emailUpdates}
                      onCheckedChange={() => handleNotificationChange('emailUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project Alerts</p>
                      <p className="text-sm text-gray-500">Get notified about project updates</p>
                    </div>
                    <Switch 
                      checked={notifications.projectAlerts}
                      onCheckedChange={() => handleNotificationChange('projectAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Notifications</p>
                      <p className="text-sm text-gray-500">Alerts for payments and invoices</p>
                    </div>
                    <Switch 
                      checked={notifications.paymentNotifications}
                      onCheckedChange={() => handleNotificationChange('paymentNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-500">Promotional content and newsletters</p>
                    </div>
                    <Switch 
                      checked={notifications.marketingEmails}
                      onCheckedChange={() => handleNotificationChange('marketingEmails')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Real-time browser notifications</p>
                    </div>
                    <Switch 
                      checked={notifications.pushNotifications}
                      onCheckedChange={() => handleNotificationChange('pushNotifications')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <User className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 
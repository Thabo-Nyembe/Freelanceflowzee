'use client'

import { useState } from 'react'
import { 
  User, Camera, MapPin, Globe, Mail, Phone, Star, Award, 
  Download, Share2, Edit3, Plus, Briefcase, GraduationCap,
  Calendar, Clock, DollarSign, Eye, TrendingUp, Heart,
  Github, Linkedin, Twitter, Instagram, Code, Palette, Video
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CVPortfolioPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Sarah Johnson',
    title: 'Senior UI/UX Designer & Frontend Developer',
    bio: 'Passionate designer with 8+ years of experience creating digital experiences that users love. Specialized in user-centered design, brand identity, and modern web development. I believe great design should be both beautiful and functional.',
    location: 'San Francisco, CA',
    email: 'sarah@freeflowzee.com',
    phone: '+1 (555) 123-4567',
    website: 'https://sarahdesigns.com',
    hourlyRate: 150,
    experience: '8+ years',
    projectsCompleted: 127,
    clientRating: 4.9,
    responseTime: '< 2 hours',
    availability: 'Available',
    avatar: '/placeholder-avatar.jpg',
    coverImage: '/placeholder-cover.jpg'
  })

  const [portfolioItems] = useState([
    {
      id: 1,
      title: 'E-commerce Mobile App',
      category: 'Mobile Design',
      client: 'Fashion Forward Inc.',
      year: '2024',
      description: 'Complete mobile app redesign focusing on user experience and conversion optimization.',
      technologies: ['Figma', 'React Native', 'TypeScript'],
      image: '/placeholder-project.jpg',
      featured: true,
      likes: 142,
      views: 1205
    },
    {
      id: 2,
      title: 'Corporate Website Redesign',
      category: 'Web Design',
      client: 'TechCorp Solutions',
      year: '2024',
      description: 'Modern, responsive website with focus on performance and accessibility.',
      technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
      image: '/placeholder-project.jpg',
      featured: true,
      likes: 98,
      views: 856
    },
    {
      id: 3,
      title: 'Brand Identity Package',
      category: 'Branding',
      client: 'Startup Ventures',
      year: '2023',
      description: 'Complete brand identity including logo, color palette, and brand guidelines.',
      technologies: ['Adobe Illustrator', 'Photoshop', 'InDesign'],
      image: '/placeholder-project.jpg',
      featured: false,
      likes: 76,
      views: 634
    }
  ])

  const [skills] = useState([
    { name: 'UI/UX Design', level: 95, category: 'Design' },
    { name: 'React/Next.js', level: 90, category: 'Development' },
    { name: 'TypeScript', level: 85, category: 'Development' },
    { name: 'Figma', level: 98, category: 'Design' },
    { name: 'Adobe Creative Suite', level: 92, category: 'Design' },
    { name: 'Tailwind CSS', level: 88, category: 'Development' },
    { name: 'Brand Strategy', level: 80, category: 'Strategy' },
    { name: 'User Research', level: 85, category: 'Research' }
  ])

  const [experience] = useState([
    {
      id: 1,
      position: 'Senior UI/UX Designer',
      company: 'FreeflowZee',
      period: '2022 - Present',
      description: 'Leading design initiatives for the freelance platform, focusing on user experience optimization and design system development.',
      achievements: [
        'Increased user engagement by 45% through redesigned onboarding flow',
        'Built comprehensive design system used across all products',
        'Led cross-functional team of 8 designers and developers'
      ]
    },
    {
      id: 2,
      position: 'Product Designer',
      company: 'Creative Studio Co.',
      period: '2020 - 2022',
      description: 'Designed digital products for B2B SaaS companies, specializing in dashboard interfaces and data visualization.',
      achievements: [
        'Designed 15+ successful product launches',
        'Reduced user churn by 30% through UX improvements',
        'Mentored junior designers and established design processes'
      ]
    },
    {
      id: 3,
      position: 'Frontend Developer',
      company: 'Tech Innovations',
      period: '2018 - 2020',
      description: 'Developed responsive web applications using modern JavaScript frameworks and collaborated closely with design teams.',
      achievements: [
        'Built 20+ responsive web applications',
        'Improved page load times by 60% through optimization',
        'Implemented design systems and component libraries'
      ]
    }
  ])

  const [education] = useState([
    {
      id: 1,
      degree: 'Bachelor of Design',
      field: 'Interaction Design',
      institution: 'California College of Arts',
      year: '2018',
      gpa: '3.8/4.0'
    },
    {
      id: 2,
      degree: 'Certificate',
      field: 'Frontend Development',
      institution: 'Google Developer Certification',
      year: '2019',
      gpa: 'Distinction'
    }
  ])

  const [testimonials] = useState([
    {
      id: 1,
      client: 'Michael Chen',
      company: 'TechCorp Solutions',
      role: 'Product Manager',
      content: 'Sarah delivered exceptional work that exceeded our expectations. Her attention to detail and user-centered approach resulted in a 40% increase in user engagement.',
      rating: 5,
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 2,
      client: 'Emma Rodriguez',
      company: 'Fashion Forward Inc.',
      role: 'Marketing Director',
      content: 'Working with Sarah was a pleasure. She understood our brand vision perfectly and delivered a mobile app that our users absolutely love.',
      rating: 5,
      avatar: '/placeholder-avatar.jpg'
    }
  ])

  const [socialLinks] = useState([
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/sarahjohnson', icon: Linkedin },
    { platform: 'GitHub', url: 'https://github.com/sarahjohnson', icon: Github },
    { platform: 'Twitter', url: 'https://twitter.com/sarahdesigns', icon: Twitter },
    { platform: 'Instagram', url: 'https://instagram.com/sarahdesigns', icon: Instagram }
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professional CV & Portfolio</h1>
          <p className="text-gray-600 mt-1">Showcase your expertise and attract premium clients</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview CV
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Profile
          </Button>
          <Button onClick={() => setIsEditing(!isEditing)} className="gap-2">
            <Edit3 className="h-4 w-4" />
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="relative overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardContent className="relative -mt-24 pb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 pt-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="text-3xl font-bold border-0 p-0 h-auto"
                      />
                      <Input 
                        value={profile.title} 
                        onChange={(e) => setProfile({...profile, title: e.target.value})}
                        className="text-xl text-gray-600 border-0 p-0 h-auto"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                      <p className="text-xl text-gray-600">{profile.title}</p>
                    </>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {profile.responseTime} response time
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${profile.hourlyRate}/hour
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {profile.availability}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {socialLinks.map((link) => (
                      <Button key={link.platform} variant="outline" size="sm" className="w-10 h-10 p-0">
                        <link.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-2xl font-bold text-indigo-600">{profile.projectsCompleted}</div>
                    <div className="text-sm text-gray-500">Projects</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-2xl font-bold text-green-600">{profile.clientRating}</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About Me
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={4}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                  )}
                </CardContent>
              </Card>

              {/* Featured Portfolio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Featured Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolioItems.filter(item => item.featured).map((item) => (
                      <div key={item.id} className="group relative overflow-hidden rounded-lg border hover:shadow-lg transition-all">
                        <div className="aspect-video bg-gray-200 relative">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm">
                              View Project
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.client} • {item.year}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {item.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {item.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Client Satisfaction</span>
                    <span className="font-semibold">{profile.clientRating}/5.0</span>
                  </div>
                  <Progress value={98} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Project Completion</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['UI/UX Design', 'Web Development', 'Mobile App Design', 'Brand Identity', 'Prototyping', 'User Research'].map((service) => (
                    <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{service}</span>
                      <Badge variant="secondary" className="text-xs">Available</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Status</span>
                      <Badge className="bg-green-100 text-green-700">{profile.availability}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Available</span>
                      <span className="text-sm font-medium">Next Week</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium">{profile.responseTime}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Portfolio Projects</h3>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </div>
                  {item.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <Badge variant="outline" className="mb-2">{item.category}</Badge>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{item.client} • {item.year}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
              <div className="space-y-6">
                {experience.map((exp) => (
                  <Card key={exp.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{exp.position}</h4>
                          <p className="text-indigo-600 font-medium">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.period}</p>
                        </div>
                        <Badge variant="outline">{exp.period.split(' - ')[1] || 'Current'}</Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{exp.description}</p>
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">Key Achievements:</h5>
                        <ul className="space-y-1">
                          {exp.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <Award className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Education</h3>
              <div className="space-y-4">
                {education.map((edu) => (
                  <Card key={edu.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                          <p className="text-indigo-600">{edu.field}</p>
                          <p className="text-sm text-gray-500">{edu.institution} • {edu.year}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-700">{edu.gpa}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Technical Skills</h3>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      <span className="text-sm text-gray-500">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                    <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Skill Categories</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Palette className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">Design</h4>
                      <p className="text-sm text-gray-500">5 skills</p>
                    </div>
                  </div>
                  <Progress value={91} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">91% Average</p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Development</h4>
                      <p className="text-sm text-gray-500">3 skills</p>
                    </div>
                  </div>
                  <Progress value={87} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">87% Average</p>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.client} />
                    <AvatarFallback>{testimonial.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.client}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch for project collaborations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website"
                        value={profile.website}
                        onChange={(e) => setProfile({...profile, website: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{profile.email}</p>
                        <p className="text-sm text-gray-500">Email for inquiries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{profile.phone}</p>
                        <p className="text-sm text-gray-500">Available for calls</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{profile.website}</p>
                        <p className="text-sm text-gray-500">Portfolio website</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>Interested in working together? Let's discuss your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message-name">Your Name</Label>
                  <Input id="message-name" placeholder="Enter your name" />
                </div>
                <div>
                  <Label htmlFor="message-email">Your Email</Label>
                  <Input id="message-email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="project-type">Project Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-design">Web Design</SelectItem>
                      <SelectItem value="mobile-app">Mobile App</SelectItem>
                      <SelectItem value="branding">Branding</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell me about your project..." 
                    rows={4}
                  />
                </div>
                <Button className="w-full">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
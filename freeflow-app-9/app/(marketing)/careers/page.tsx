import { Metadata } from 'next'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers - Join the FreeflowZee Team',
  description: 'Join our growing team of passionate developers, designers, and innovators building the future of freelance management and file sharing.',
  keywords: ['careers', 'jobs', 'freelance platform jobs', 'remote work', 'developer jobs', 'design jobs'],
  openGraph: {
    title: 'Careers - Join the FreeflowZee Team',
    description: 'Join our growing team building the future of freelance management.',
    type: 'website',
  },
}

const jobOpenings = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build beautiful, responsive user interfaces using React, Next.js, and TypeScript.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'UI/UX design sense'],
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering', 
    location: 'Remote',
    type: 'Full-time',
    description: 'Design and implement scalable APIs and database systems.',
    requirements: ['Node.js expertise', 'Database design', 'Cloud platforms experience'],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create intuitive user experiences for our freelance management platform.',
    requirements: ['Figma proficiency', 'User research experience', 'Design systems knowledge'],
  },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/40">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Help us build the future of freelance management and file sharing. 
            We're looking for passionate individuals who want to make a difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Remote-first
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Flexible hours
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Competitive benefits
            </Badge>
          </div>
        </div>

        {/* Job Openings */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobOpenings.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-base mb-4">
                        {job.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{job.department}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {job.requirements.map((req, reqIndex) => (
                        <li key={reqIndex}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full">Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Culture */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Why Work With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Great Team</h3>
              <p className="text-gray-600">Work with talented, passionate people who care about building great products.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Work-Life Balance</h3>
              <p className="text-gray-600">Flexible hours and remote work options to help you do your best work.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">Learn new skills and advance your career with mentorship and training.</p>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
} 
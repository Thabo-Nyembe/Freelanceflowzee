import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { MapPin, Mail, Phone, Globe, Star, Download, Edit, Award, Users, Calendar } from "lucide-react"

export function Profile() {
  const skills = [
    { name: "UI/UX Design", level: 95 },
    { name: "Branding", level: 90 },
    { name: "Web Development", level: 85 },
    { name: "Photography", level: 80 },
    { name: "Video Editing", level: 75 },
  ]

  const testimonials = [
    {
      client: "Acme Corporation",
      rating: 5,
      text: "Exceptional work and great communication throughout the project!",
      avatar: "AC",
    },
    {
      client: "Tech Startup Inc.",
      rating: 5,
      text: "Delivered beyond expectations with incredible attention to detail.",
      avatar: "TS",
    },
    {
      client: "Creative Agency",
      rating: 5,
      text: "Professional, creative, and always on time. Highly recommended!",
      avatar: "CA",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Professional Profile</h2>
          <p className="text-lg text-slate-500 mt-1">Your digital portfolio and CV</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            <Download className="h-4 w-4 mr-2" />
            Download CV
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Profile Overview */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-8 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-6 border-4 border-white shadow-lg">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                JD
              </AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">John Doe</h3>
            <p className="text-purple-600 font-medium mb-4">Creative Designer & Developer</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span>New York, NY</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span>4.9 (127 reviews)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-slate-600">Projects Completed</span>
              </div>
              <span className="font-semibold text-slate-800">127</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-slate-600">Happy Clients</span>
              </div>
              <span className="font-semibold text-slate-800">89</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-slate-600">Years Experience</span>
              </div>
              <span className="font-semibold text-slate-800">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="text-sm text-slate-600">Average Rating</span>
              </div>
              <span className="font-semibold text-slate-800">4.9/5</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-800">john.doe@email.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-800">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Website</p>
                <p className="font-medium text-slate-800">www.johndoe.design</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Expertise */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Skills & Expertise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-800">{skill.name}</span>
                  <span className="text-sm text-slate-500">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Professional Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative pl-8 border-l-2 border-purple-200">
            <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full"></div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800">Senior Creative Designer</h4>
              <p className="text-purple-600 font-medium">Creative Studio Inc. • 2020 - Present</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Leading design projects for Fortune 500 companies, specializing in brand identity and digital
                experiences. Managed a team of 5 designers and increased client satisfaction by 40%.
              </p>
            </div>
          </div>

          <div className="relative pl-8 border-l-2 border-blue-200">
            <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800">Freelance Designer & Developer</h4>
              <p className="text-blue-600 font-medium">Self-employed • 2018 - 2020</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Worked with startups and small businesses to create compelling visual identities and web experiences.
                Completed over 80 projects with a 98% client satisfaction rate.
              </p>
            </div>
          </div>

          <div className="relative pl-8 border-l-2 border-emerald-200">
            <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full"></div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800">Junior Designer</h4>
              <p className="text-emerald-600 font-medium">Design Agency Ltd. • 2016 - 2018</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Developed design skills working on various client projects including branding, web design, and print
                materials. Contributed to award-winning campaigns for major brands.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Testimonials */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Client Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{testimonial.client}</p>
                    <p className="text-xs text-slate-500">Verified Client</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

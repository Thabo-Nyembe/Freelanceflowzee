// import React, {} from 'react'
import { useSupabase } from '../../__mocks__/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'

interface Skill {
  id: number
  name: string
  level: string
}

interface Project {
  id: number
  title: string
  description: string
  link: string
  image?: string
}

const Portfolio = () => {
  const { supabase: _supabase } = useSupabase()
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [aboutText, setAboutText] = useState('I am a passionate developer with experience in web development...')
  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: 'JavaScript', level: 'Expert' },
    { id: 2, name: 'React', level: 'Advanced' },
    { id: 3, name: 'Node.js', level: 'Intermediate' }
  ])
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: 'Portfolio Website',
      description: 'A personal portfolio website built with React and Next.js',
      link: 'https://example.com',
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=portfolio'
    }
  ])
  const [newSkill, setNewSkill] = useState({ name: '', level: '' })
  const [newProject, setNewProject] = useState({ title: '', description: '', link: '' })
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [sections, setSections] = useState(['about', 'skills', 'projects'])

  const handleSaveAbout = async () => {
    // In a real app, we would save to the database here
    setIsEditingAbout(false)
    setSuccessMessage('Changes saved!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const validateSkill = () => {
    const newErrors: Record<string, string> = {}
    if (!newSkill.name) newErrors.skillName = 'Skill name is required'
    if (!newSkill.level) newErrors.skillLevel = 'Skill level is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateProject = () => {
    const newErrors: Record<string, string> = {}
    if (!newProject.title) newErrors.title = 'Title is required'
    if (!newProject.description) newErrors.description = 'Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddSkill = () => {
    if (!validateSkill()) return

    setSkills(prev => [...prev, { id: prev.length + 1, ...newSkill }])
    setNewSkill({ name: '', level: '' })
    setShowAddSkill(false)
    setSuccessMessage('Skill added successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleAddProject = () => {
    if (!validateProject()) return

    setProjects(prev => [...prev, { id: prev.length + 1, ...newProject }])
    setNewProject({ title: '', description: '', link: '' })
    setShowAddProject(false)
    setSuccessMessage('Project added successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, we would upload to storage here
      setSuccessMessage('Image uploaded successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const moveSectionUp = (index: number) => {
    if (index === 0) return
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index - 1]
    newSections[index - 1] = temp
    setSections(newSections)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">My Portfolio</h1>

      {successMessage && (
        <div className="bg-green-100 text-green-800 p-3 rounded">
          {successMessage}
        </div>
      )}

      {sections.map((section, index) => (
        <div key={section} className="relative">
          {index > 0 && (
            <Button
              data-testid={`move-${section}-up`}
              variant="outline"
              size="sm"
              className="absolute -top-2 right-0"
              onClick={() => moveSectionUp(index)}
            >
              Move Up
            </Button>
          )}

          {section === 'about' && (
            <Card data-testid="about-section">
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingAbout ? (
                  <div className="space-y-4">
                    <Textarea
                      data-testid="about-input"
                      value={aboutText}
                      onChange={e => setAboutText(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <Button
                      data-testid="save-about-button"
                      onClick={handleSaveAbout}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4">{aboutText}</p>
                    <Button
                      data-testid="edit-about-button"
                      variant="outline"
                      onClick={() => setIsEditingAbout(true)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {section === 'skills' && (
            <Card data-testid="skills-section">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {skills.map(skill => (
                    <Card key={skill.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <p className="text-gray-500">{skill.level}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
                  <DialogTrigger asChild>
                    <Button data-testid="add-skill-button">Add Skill</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Skill</DialogTitle>
                      <DialogDescription>Enter the details of your new skill.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Skill Name</label>
                        <Input
                          data-testid="skill-name-input"
                          value={newSkill.name}
                          onChange={e => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                        />
                        {errors.skillName && (
                          <p className="text-red-500 text-sm mt-1">{errors.skillName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Skill Level</label>
                        <Select
                          value={newSkill.level}
                          onValueChange={value => setNewSkill(prev => ({ ...prev, level: value }))}
                        >
                          <SelectTrigger data-testid="skill-level-input">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.skillLevel && (
                          <p className="text-red-500 text-sm mt-1">{errors.skillLevel}</p>
                        )}
                      </div>
                      <Button
                        data-testid="save-skill-button"
                        className="w-full"
                        onClick={handleAddSkill}
                      >
                        Add Skill
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {section === 'projects' && (
            <Card data-testid="projects-section">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {projects.map(project => (
                    <Card key={project.id}>
                      <CardContent className="p-4">
                        {project.image && (
                          <img
                            src={project.image}
                            alt="Portfolio image"
                            className="w-full h-40 object-cover rounded mb-4"
                          />
                        )}
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-gray-500 mt-2">{project.description}</p>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline mt-2 block"
                          >
                            View Project
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
                  <DialogTrigger asChild>
                    <Button data-testid="add-project-button">Add Project</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Project</DialogTitle>
                      <DialogDescription>Enter the details of your new project.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Project Title</label>
                        <Input
                          data-testid="project-title-input"
                          value={newProject.title}
                          onChange={e => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          data-testid="project-description-input"
                          value={newProject.description}
                          onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Project Link</label>
                        <Input
                          data-testid="project-link-input"
                          value={newProject.link}
                          onChange={e => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Project Image</label>
                        <Input
                          data-testid="upload-image-button"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                      <Button
                        data-testid="save-project-button"
                        className="w-full"
                        onClick={handleAddProject}
                      >
                        Add Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}

export default Portfolio 
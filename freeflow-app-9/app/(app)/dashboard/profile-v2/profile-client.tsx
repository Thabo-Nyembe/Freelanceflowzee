'use client'

import { useState } from 'react'
import { useUserProfile, UserProfile, ProfileStats, ExperienceItem, PortfolioItem } from '@/lib/hooks/use-user-profile'
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
  Plus,
  X,
  Loader2,
  Trash2
} from 'lucide-react'

interface ProfileClientProps {
  initialProfile: UserProfile | null
  initialStats: ProfileStats
}

export default function ProfileClient({ initialProfile, initialStats }: ProfileClientProps) {
  const {
    profile,
    stats,
    loading,
    createProfile,
    updateProfile,
    addSkill,
    removeSkill,
    addExperience,
    removeExperience,
    addPortfolioItem,
    removePortfolioItem,
    setAvailability
  } = useUserProfile(initialProfile, initialStats)

  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'experience' | 'portfolio'>('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [editingProfile, setEditingProfile] = useState({
    name: '',
    title: '',
    company: '',
    bio: '',
    location: '',
    phone: '',
    website: ''
  })
  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false
  })

  const handleEditProfile = () => {
    if (profile) {
      setEditingProfile({
        name: profile.name || '',
        title: profile.title || '',
        company: profile.company || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        website: profile.website || ''
      })
    }
    setShowEditModal(true)
  }

  const handleSaveProfile = async () => {
    if (profile) {
      await updateProfile(editingProfile)
    } else {
      await createProfile(editingProfile)
    }
    setShowEditModal(false)
  }

  const handleAddSkill = async () => {
    if (newSkill.trim()) {
      await addSkill(newSkill.trim())
      setNewSkill('')
      setShowSkillModal(false)
    }
  }

  const handleAddExperience = async () => {
    if (newExperience.company && newExperience.role) {
      await addExperience(newExperience as any)
      setNewExperience({
        company: '',
        role: '',
        description: '',
        start_date: '',
        end_date: '',
        is_current: false
      })
      setShowExperienceModal(false)
    }
  }

  const displayStats = [
    { label: 'Projects Completed', value: (profile?.projects_completed || 0).toString(), change: 12.5, icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Client Rating', value: (profile?.rating || 0).toFixed(1), change: 5.2, icon: <Star className="w-5 h-5" /> },
    { label: 'Total Reviews', value: (profile?.reviews_count || 0).toString(), change: 15.3, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Followers', value: (profile?.followers_count || 0).toLocaleString(), change: 8.7, icon: <Users className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
            <GradientButton from="blue" to="cyan" onClick={handleEditProfile}>
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        {/* Profile Header Card */}
        <BentoCard className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group mb-4">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'user'}`}
                  alt={profile?.name || 'User'}
                  className="w-32 h-32 rounded-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{profile?.name || 'Your Name'}</h2>
                {profile?.is_verified && (
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-2">{profile?.title || 'Your Title'}</p>
              <p className="text-muted-foreground mb-4">{profile?.company || 'Your Company'}</p>
              <p className="text-muted-foreground leading-relaxed mb-4">{profile?.bio || 'Add a bio to tell others about yourself...'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {profile.website}
                  </div>
                )}
                {profile?.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                )}
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
                <p className="text-muted-foreground leading-relaxed">
                  {profile?.bio || 'No bio added yet. Click Edit Profile to add one.'}
                </p>
              </BentoCard>
            )}

            {selectedTab === 'skills' && (
              <BentoCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Skills & Expertise</h3>
                  <ModernButton variant="outline" size="sm" onClick={() => setShowSkillModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </ModernButton>
                </div>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      >
                        <span>{skill}</span>
                        <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No skills added yet.</p>
                )}
              </BentoCard>
            )}

            {selectedTab === 'experience' && (
              <BentoCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Work Experience</h3>
                  <ModernButton variant="outline" size="sm" onClick={() => setShowExperienceModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </ModernButton>
                </div>
                {profile?.experience && profile.experience.length > 0 ? (
                  <div className="space-y-6">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 relative">
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="absolute right-0 top-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className="font-semibold">{exp.role}</h4>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                        </p>
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No experience added yet.</p>
                )}
              </BentoCard>
            )}

            {selectedTab === 'portfolio' && (
              <BentoCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Portfolio</h3>
                  <ModernButton variant="outline" size="sm" onClick={() => console.log('Add portfolio item')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </ModernButton>
                </div>
                {profile?.portfolio_items && profile.portfolio_items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolio_items.map((item, index) => (
                      <div key={index} className="rounded-lg border border-border overflow-hidden group cursor-pointer relative">
                        <button
                          onClick={() => removePortfolioItem(item.id)}
                          className="absolute right-2 top-2 z-10 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <div className="relative">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop'}
                            alt={item.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No portfolio items added yet.</p>
                )}
              </BentoCard>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <BentoQuickAction icon={<Edit />} title="Edit Profile" description="Update info" onClick={handleEditProfile} />
              <BentoQuickAction icon={<Plus />} title="Add Project" description="Portfolio" onClick={() => setSelectedTab('portfolio')} />
              <BentoQuickAction icon={<Download />} title="Export CV" description="PDF format" onClick={() => console.log('Export')} />
            </div>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Profile Views" value={(profile?.views_count || 0).toLocaleString()} change={12.5} />
                <MiniKPI label="Rating" value={(profile?.rating || 0).toFixed(1)} change={5.2} />
                <MiniKPI label="Profile Completeness" value={`${stats.profileCompleteness}%`} change={8.3} />
                <MiniKPI label="Followers" value={(profile?.followers_count || 0).toLocaleString()} change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingProfile.title}
                  onChange={(e) => setEditingProfile({ ...editingProfile, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={editingProfile.company}
                  onChange={(e) => setEditingProfile({ ...editingProfile, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={editingProfile.bio}
                  onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={editingProfile.location}
                  onChange={(e) => setEditingProfile({ ...editingProfile, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingProfile.phone}
                  onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={editingProfile.website}
                  onChange={(e) => setEditingProfile({ ...editingProfile, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  Cancel
                </ModernButton>
                <GradientButton from="blue" to="cyan" className="flex-1" onClick={handleSaveProfile} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Skill</h2>
              <button onClick={() => setShowSkillModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name</label>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React, TypeScript, UI Design"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowSkillModal(false)}>
                  Cancel
                </ModernButton>
                <GradientButton from="blue" to="cyan" className="flex-1" onClick={handleAddSkill} disabled={loading || !newSkill.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Skill'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Experience</h2>
              <button onClick={() => setShowExperienceModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <input
                  type="text"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={newExperience.end_date}
                    onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                    disabled={newExperience.is_current}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={newExperience.is_current}
                  onChange={(e) => setNewExperience({ ...newExperience, is_current: e.target.checked, end_date: '' })}
                  className="rounded border-border"
                />
                <label htmlFor="is_current" className="text-sm">Currently working here</label>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowExperienceModal(false)}>
                  Cancel
                </ModernButton>
                <GradientButton
                  from="blue"
                  to="cyan"
                  className="flex-1"
                  onClick={handleAddExperience}
                  disabled={loading || !newExperience.company || !newExperience.role}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Experience'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Profile Utilities
 *
 * Comprehensive user profile management with personal information, skills,
 * experience, portfolio, social links, and account settings.
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('ProfileUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ProfileStatus = 'active' | 'inactive' | 'suspended' | 'pending'
export type AccountType = 'free' | 'pro' | 'business' | 'enterprise'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type PrivacyLevel = 'public' | 'connections' | 'private'

export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
  coverImage?: string
  location?: string
  timezone: string
  website?: string
  company?: string
  title?: string
  status: ProfileStatus
  accountType: AccountType
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: SkillLevel
  yearsOfExperience: number
  endorsements: number
}

export interface Experience {
  id: string
  userId: string
  company: string
  title: string
  location?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
  achievements: string[]
}

export interface Education {
  id: string
  userId: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  current: boolean
  grade?: string
  activities?: string[]
}

export interface Portfolio {
  id: string
  userId: string
  title: string
  description: string
  category: string
  tags: string[]
  thumbnail?: string
  images: string[]
  url?: string
  featured: boolean
  likes: number
  views: number
  createdAt: string
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  displayName?: string
  verified: boolean
}

export interface ProfileSettings {
  id: string
  userId: string
  privacyLevel: PrivacyLevel
  showEmail: boolean
  showPhone: boolean
  showLocation: boolean
  allowMessages: boolean
  allowConnections: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  language: string
  theme: 'light' | 'dark' | 'auto'
}

export interface ProfileStats {
  profileViews: number
  profileViewsThisMonth: number
  connections: number
  endorsements: number
  portfolioViews: number
  portfolioLikes: number
  completionPercentage: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  category: string
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

export function generateMockProfile(userId: string = 'user-1'): UserProfile {
  return {
    id: `profile-${userId}`,
    userId,
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate developer and designer creating beautiful digital experiences. 10+ years of experience in web development, UI/UX design, and product management.',
    avatar: '/avatars/default.jpg',
    coverImage: '/covers/default.jpg',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    website: 'https://johndoe.com',
    company: 'Tech Innovations Inc.',
    title: 'Senior Full Stack Developer',
    status: 'active',
    accountType: 'pro',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
}

export function generateMockSkills(count: number = 15): Skill[] {
  const skills: Skill[] = []
  const categories = ['Programming', 'Design', 'Marketing', 'Business', 'Data']
  const skillNames = {
    Programming: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js'],
    Design: ['UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
    Marketing: ['SEO', 'Content Marketing', 'Social Media', 'Email Marketing', 'Analytics'],
    Business: ['Project Management', 'Strategy', 'Leadership', 'Communication', 'Negotiation'],
    Data: ['SQL', 'Data Analysis', 'Machine Learning', 'Statistics', 'Visualization']
  }
  const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length]
    const skillList = skillNames[category as keyof typeof skillNames]
    const skillName = skillList[i % skillList.length]

    skills.push({
      id: `skill-${i + 1}`,
      name: skillName,
      category,
      level: levels[Math.floor(Math.random() * levels.length)],
      yearsOfExperience: Math.floor(Math.random() * 10) + 1,
      endorsements: Math.floor(Math.random() * 50)
    })
  }

  logger.debug('Generated mock skills', { count: skills.length })
  return skills
}

export function generateMockExperience(count: number = 5, userId: string = 'user-1'): Experience[] {
  const experiences: Experience[] = []
  const companies = ['Tech Corp', 'Digital Solutions', 'Innovation Labs', 'Cloud Systems', 'Data Dynamics']
  const titles = ['Senior Developer', 'Lead Designer', 'Product Manager', 'Software Engineer', 'UX Designer']

  for (let i = 0; i < count; i++) {
    const yearsAgo = i * 2
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - yearsAgo - 2)

    const isCurrent = i === 0
    let endDate: string | undefined
    if (!isCurrent) {
      const end = new Date()
      end.setFullYear(end.getFullYear() - yearsAgo)
      endDate = end.toISOString().split('T')[0]
    }

    experiences.push({
      id: `exp-${i + 1}`,
      userId,
      company: companies[i % companies.length],
      title: titles[i % titles.length],
      location: 'San Francisco, CA',
      startDate: startDate.toISOString().split('T')[0],
      endDate,
      current: isCurrent,
      description: 'Led development of key features and mentored junior developers.',
      achievements: [
        'Increased performance by 40%',
        'Reduced bugs by 60%',
        'Implemented CI/CD pipeline'
      ]
    })
  }

  logger.debug('Generated mock experience', { count: experiences.length })
  return experiences
}

export function generateMockEducation(count: number = 3, userId: string = 'user-1'): Education[] {
  const education: Education[] = []
  const schools = ['Stanford University', 'MIT', 'UC Berkeley', 'Harvard', 'Carnegie Mellon']
  const degrees = ['Bachelor of Science', 'Master of Science', 'PhD']
  const fields = ['Computer Science', 'Software Engineering', 'Data Science', 'Design', 'Business']

  for (let i = 0; i < count; i++) {
    const yearsAgo = i * 4 + 5
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - yearsAgo - 4)

    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() - yearsAgo)

    education.push({
      id: `edu-${i + 1}`,
      userId,
      school: schools[i % schools.length],
      degree: degrees[i % degrees.length],
      field: fields[i % fields.length],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      current: false,
      grade: '3.8 GPA',
      activities: ['Computer Science Club', 'Hackathons', 'Research Assistant']
    })
  }

  logger.debug('Generated mock education', { count: education.length })
  return education
}

export function generateMockPortfolio(count: number = 10, userId: string = 'user-1'): Portfolio[] {
  const portfolios: Portfolio[] = []
  const categories = ['Web Development', 'Mobile App', 'UI/UX Design', 'Branding', 'Illustration']

  for (let i = 0; i < count; i++) {
    portfolios.push({
      id: `portfolio-${i + 1}`,
      userId,
      title: `Project ${i + 1}`,
      description: 'A comprehensive project showcasing modern design and development practices.',
      category: categories[i % categories.length],
      tags: ['React', 'TypeScript', 'Design', 'UI/UX'],
      thumbnail: `/portfolio/project-${i + 1}-thumb.jpg`,
      images: [
        `/portfolio/project-${i + 1}-1.jpg`,
        `/portfolio/project-${i + 1}-2.jpg`,
        `/portfolio/project-${i + 1}-3.jpg`
      ],
      url: `https://project${i + 1}.example.com`,
      featured: i < 3,
      likes: Math.floor(Math.random() * 500),
      views: Math.floor(Math.random() * 5000),
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.debug('Generated mock portfolio', { count: portfolios.length })
  return portfolios
}

export function generateMockSocialLinks(): SocialLink[] {
  return [
    { id: 'social-1', platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe', displayName: 'John Doe', verified: true },
    { id: 'social-2', platform: 'Twitter', url: 'https://twitter.com/johndoe', displayName: '@johndoe', verified: true },
    { id: 'social-3', platform: 'GitHub', url: 'https://github.com/johndoe', displayName: 'johndoe', verified: true },
    { id: 'social-4', platform: 'Dribbble', url: 'https://dribbble.com/johndoe', displayName: 'johndoe', verified: false },
    { id: 'social-5', platform: 'Behance', url: 'https://behance.net/johndoe', displayName: 'John Doe', verified: false }
  ]
}

export function generateMockProfileStats(): ProfileStats {
  return {
    profileViews: 12450,
    profileViewsThisMonth: 890,
    connections: 567,
    endorsements: 234,
    portfolioViews: 8920,
    portfolioLikes: 1245,
    completionPercentage: 85
  }
}

export function generateMockAchievements(count: number = 8): Achievement[] {
  const achievements: Achievement[] = []
  const templates = [
    { name: 'Profile Complete', description: 'Completed 100% of your profile', icon: '🏆', category: 'Profile' },
    { name: 'First Connection', description: 'Made your first connection', icon: '🤝', category: 'Network' },
    { name: 'Portfolio Star', description: 'Added 5 portfolio items', icon: '⭐', category: 'Portfolio' },
    { name: 'Skill Master', description: 'Added 10 skills to your profile', icon: '🎓', category: 'Skills' },
    { name: 'Social Butterfly', description: 'Connected all social accounts', icon: '🦋', category: 'Social' },
    { name: 'Experience Expert', description: 'Added 5 years of experience', icon: '💼', category: 'Experience' },
    { name: 'Popular Profile', description: 'Reached 1000 profile views', icon: '👁️', category: 'Engagement' },
    { name: 'Verified Member', description: 'Verified email and phone', icon: '✅', category: 'Verification' }
  ]

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length]
    achievements.push({
      id: `achievement-${i + 1}`,
      ...template,
      unlockedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.debug('Generated mock achievements', { count: achievements.length })
  return achievements
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateProfileCompletion(profile: UserProfile, skills: Skill[], experience: Experience[]): number {
  let score = 0
  const maxScore = 100

  // Basic info (40 points)
  if (profile.firstName && profile.lastName) score += 5
  if (profile.email) score += 5
  if (profile.bio) score += 10
  if (profile.avatar) score += 10
  if (profile.location) score += 5
  if (profile.phone) score += 5

  // Professional info (30 points)
  if (profile.company) score += 5
  if (profile.title) score += 5
  if (skills.length >= 5) score += 10
  if (experience.length >= 2) score += 10

  // Verification (20 points)
  if (profile.emailVerified) score += 10
  if (profile.phoneVerified) score += 10

  // Additional (10 points)
  if (profile.website) score += 5
  if (profile.coverImage) score += 5

  return Math.min(score, maxScore)
}

export function getSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)
}

export function sortSkillsByEndorsements(skills: Skill[]): Skill[] {
  return [...skills].sort((a, b) => b.endorsements - a.endorsements)
}

export function getTopSkills(skills: Skill[], limit: number = 5): Skill[] {
  return sortSkillsByEndorsements(skills).slice(0, limit)
}

export function getCurrentExperience(experiences: Experience[]): Experience | undefined {
  return experiences.find(exp => exp.current)
}

export function getTotalYearsOfExperience(experiences: Experience[]): number {
  return experiences.reduce((total, exp) => {
    const start = new Date(exp.startDate)
    const end = exp.endDate ? new Date(exp.endDate) : new Date()
    const years = (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    return total + years
  }, 0)
}

export function getFeaturedPortfolio(portfolios: Portfolio[]): Portfolio[] {
  return portfolios.filter(p => p.featured)
}

export function sortPortfolioByPopularity(portfolios: Portfolio[]): Portfolio[] {
  return [...portfolios].sort((a, b) => (b.likes + b.views / 10) - (a.likes + a.views / 10))
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function formatSocialPlatform(platform: string): string {
  const platforms: Record<string, string> = {
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    github: 'GitHub',
    dribbble: 'Dribbble',
    behance: 'Behance',
    instagram: 'Instagram',
    facebook: 'Facebook'
  }
  return platforms[platform.toLowerCase()] || platform
}

export function getSkillLevelColor(level: SkillLevel): string {
  const colors = {
    beginner: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-green-100 text-green-700',
    advanced: 'bg-orange-100 text-orange-700',
    expert: 'bg-purple-100 text-purple-700'
  }
  return colors[level]
}

export function getAccountTypeBadge(type: AccountType): { label: string; color: string } {
  const badges = {
    free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
    pro: { label: 'Pro', color: 'bg-blue-100 text-blue-700' },
    business: { label: 'Business', color: 'bg-purple-100 text-purple-700' },
    enterprise: { label: 'Enterprise', color: 'bg-gold-100 text-gold-700' }
  }
  return badges[type]
}

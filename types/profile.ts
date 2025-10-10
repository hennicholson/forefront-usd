export interface Experience {
  id: string
  company: string
  title: string
  employmentType?: string // Full-time, Part-time, Contract, etc.
  location: string
  startDate: string // YYYY-MM format
  endDate: string | null // null if current
  current: boolean
  description: string
  responsibilities?: string[] // Bullet points
}

export interface Education {
  id: string
  school: string
  degree?: string
  fieldOfStudy?: string
  startDate: string
  endDate: string | null
  current: boolean
  grade?: string
  activities?: string
  description?: string
}

export interface Skill {
  name: string
  endorsements?: number
}

export interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  expirationDate?: string | null
  credentialId?: string
  credentialUrl?: string
}

export interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string | null
  current: boolean
  url?: string
  skills?: string[]
}

export interface Award {
  id: string
  title: string
  issuer: string
  issueDate: string
  description?: string
}

export interface SocialLinks {
  linkedin?: string
  twitter?: string
  github?: string
  portfolio?: string
  instagram?: string
  other?: string
}

export interface UserProfile {
  id: string
  email: string
  name: string

  // Basic
  bio?: string
  headline?: string
  location?: string
  phone?: string
  website?: string
  profileImage?: string

  // Summary
  summary?: string

  // Structured
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
  projects: Project[]
  awards: Award[]
  interests: string[]

  // Social
  socialLinks: SocialLinks

  // Meeting
  meetingLink?: string
  availability?: string

  // Meta
  isAdmin?: boolean
  profileComplete?: boolean
  createdAt?: Date
  updatedAt?: Date
}

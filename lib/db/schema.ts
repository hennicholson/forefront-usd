import { pgTable, text, timestamp, integer, boolean, jsonb, serial } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),

  // Basic Info
  bio: text('bio'),
  headline: text('headline'),
  location: text('location'),
  phone: text('phone'),
  website: text('website'),
  profileImage: text('profile_image'),
  bannerImage: text('banner_image'),

  // Professional Summary
  summary: text('summary'),

  // Structured Data (JSON)
  experience: jsonb('experience').default('[]'), // Array of job positions
  education: jsonb('education').default('[]'), // Array of schools
  skills: jsonb('skills').default('[]'), // Array of skills
  certifications: jsonb('certifications').default('[]'), // Array of certs
  projects: jsonb('projects').default('[]'), // Array of projects
  awards: jsonb('awards').default('[]'), // Array of awards/honors
  interests: jsonb('interests').default('[]'),

  // Social/Contact
  socialLinks: jsonb('social_links').default('{}'),

  // Meeting
  meetingLink: text('meeting_link'),
  availability: text('availability'),

  // Profile Visibility
  profileVisibility: jsonb('profile_visibility').default('{"experience":true,"education":true,"skills":true,"certifications":true,"projects":true,"awards":true}'),

  // AI Integration
  geminiApiKey: text('gemini_api_key'),

  // Onboarding
  onboardingComplete: boolean('onboarding_complete').default(false),
  onboardingStep: integer('onboarding_step').default(0),

  // Metadata
  isAdmin: boolean('is_admin').default(false),
  profileComplete: boolean('profile_complete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  moduleId: text('module_id').notNull().unique(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  instructor: jsonb('instructor').notNull(),
  duration: text('duration').notNull(),
  skillLevel: text('skill_level').notNull(),
  introVideo: text('intro_video').notNull(),
  learningObjectives: jsonb('learning_objectives').notNull(),
  slides: jsonb('slides').notNull(),
  keyTakeaways: jsonb('key_takeaways').notNull(),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  moduleId: text('module_id').notNull(),
  completedSlides: jsonb('completed_slides').notNull().default('[]'),
  lastViewed: integer('last_viewed').notNull().default(0),
  completed: boolean('completed').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  moduleId: text('module_id').notNull(),
  slideId: integer('slide_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  skillLevel: text('skill_level').notNull(),
  estimatedDuration: text('estimated_duration').notNull(),
  status: text('status').notNull().default('pending'),
  submittedAt: timestamp('submitted_at').defaultNow(),
})

export const newsletters = pgTable('newsletters', {
  id: serial('id').primaryKey(),
  week: integer('week').notNull(),
  date: text('date').notNull(),
  title: text('title').notNull(),
  content: jsonb('content').notNull(),
  isCurrent: boolean('is_current').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const learning = pgTable('learning', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  moduleId: text('module_id').notNull(),
  status: text('status').notNull().default('learning'), // learning, completed, paused
  startedAt: timestamp('started_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Messages table - For chat messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id),
  receiverId: text('receiver_id').references(() => users.id), // null for group chats
  roomId: text('room_id'), // for group/topic chats
  content: text('content').notNull(),
  type: text('type').notNull().default('text'), // text, image, file
  createdAt: timestamp('created_at').defaultNow(),
})

// Connections table - User relationships
export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  followerId: text('follower_id').notNull().references(() => users.id),
  followingId: text('following_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // pending, accepted, rejected
  createdAt: timestamp('created_at').defaultNow(),
})

// Posts table - Social updates
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  type: text('type').notNull().default('text'), // text, link, achievement
  topic: text('topic'), // topic/module this post is associated with
  metadata: jsonb('metadata').default('{}'), // for links, images, etc.
  createdAt: timestamp('created_at').defaultNow(),
})

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Reactions table
export const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id),
  commentId: integer('comment_id').references(() => comments.id),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // like, helpful, insightful
  createdAt: timestamp('created_at').defaultNow(),
})

// Study groups
export const studyGroups = pgTable('study_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  topic: text('topic').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// Group members
export const groupMembers = pgTable('group_members', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => studyGroups.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('member'), // admin, moderator, member
  joinedAt: timestamp('joined_at').defaultNow(),
})

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // connection_request, new_message, post_comment, etc.
  content: text('content').notNull(),
  metadata: jsonb('metadata').default('{}'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

// Workflows
export const workflows = pgTable('workflows', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // video, coding, marketing, design, content, automation
  isPublic: boolean('is_public').notNull().default(true),
  likesCount: integer('likes_count').notNull().default(0),
  viewsCount: integer('views_count').notNull().default(0),
  forksCount: integer('forks_count').notNull().default(0),
  forkedFrom: integer('forked_from').references((): any => workflows.id),
  nodes: jsonb('nodes').notNull().default('[]'), // Array of workflow nodes
  connections: jsonb('connections').notNull().default('[]'), // Array of connections between nodes
  canvasSettings: jsonb('canvas_settings').default('{"zoom":1,"pan":{"x":0,"y":0}}'),
  metadata: jsonb('metadata').default('{}'), // tags, difficulty, estimatedTime, tools
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Workflow likes
export const workflowLikes = pgTable('workflow_likes', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// Workflow comments
export const workflowComments = pgTable('workflow_comments', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Muted users - Admin moderation
export const mutedUsers = pgTable('muted_users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  mutedBy: text('muted_by').notNull().references(() => users.id),
  topic: text('topic'), // null = global mute, specific topic = muted in that channel
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // null = permanent
})

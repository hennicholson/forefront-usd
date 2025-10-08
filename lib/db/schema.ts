import { pgTable, text, timestamp, integer, boolean, jsonb, serial } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'),
  interests: jsonb('interests').default('[]'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
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

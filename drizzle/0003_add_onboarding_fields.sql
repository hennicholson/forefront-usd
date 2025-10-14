-- Add onboarding fields to users table
ALTER TABLE "users" ADD COLUMN "onboarding_complete" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN "onboarding_step" integer DEFAULT 0;

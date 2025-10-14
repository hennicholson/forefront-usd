-- Add profile visibility column
ALTER TABLE "users" ADD COLUMN "profile_visibility" jsonb DEFAULT '{"experience":true,"education":true,"skills":true,"certifications":true,"projects":true,"awards":true}';

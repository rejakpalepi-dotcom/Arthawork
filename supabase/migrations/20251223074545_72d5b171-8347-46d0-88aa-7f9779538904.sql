-- Add has_completed_onboarding flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_completed_onboarding boolean NOT NULL DEFAULT false;
-- =====================================================
-- STEP 3: Create projects table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  
  portal_token UUID DEFAULT gen_random_uuid() UNIQUE,
  portal_password TEXT,
  
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'review', 'revision', 'final', 'archived')),
  current_version INTEGER DEFAULT 1,
  
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view projects by portal token" ON public.projects;

CREATE POLICY "Users can manage their own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view projects by portal token"
  ON public.projects FOR SELECT
  USING (portal_token IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_portal_token ON public.projects(portal_token);

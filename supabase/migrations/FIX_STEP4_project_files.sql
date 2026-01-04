-- =====================================================
-- STEP 4: Create project_files table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  
  version INTEGER NOT NULL DEFAULT 1,
  version_label TEXT,
  is_current BOOLEAN DEFAULT true,
  
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can manage project files through projects" ON public.project_files;
DROP POLICY IF EXISTS "Public can view project files by portal" ON public.project_files;

CREATE POLICY "Users can manage project files through projects"
  ON public.project_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view project files by portal"
  ON public.project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.portal_token IS NOT NULL
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);

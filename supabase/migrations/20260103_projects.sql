-- =====================================================
-- Projects, Files, and Annotations System
-- For Premium Client Portal with Pin-point Feedback
-- Created: 2026-01-03
-- =====================================================

-- =====================================================
-- 1. PROJECTS TABLE
-- Main project container linked to contracts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  
  -- Project details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Portal access
  portal_token UUID DEFAULT gen_random_uuid() UNIQUE,
  portal_password TEXT, -- Optional password protection (hashed)
  
  -- Status: locked, active, review, revision, final, archived
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'review', 'revision', 'final', 'archived')),
  current_version INTEGER DEFAULT 1,
  
  -- Timestamps
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 2. PROJECT FILES TABLE
-- File versioning system (v1, v2, ... Final)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- File info
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- image, pdf, video, etc.
  file_size INTEGER,
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  version_label TEXT, -- 'v1', 'v2', 'Final'
  is_current BOOLEAN DEFAULT true,
  
  -- Metadata for images
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 3. ANNOTATIONS TABLE
-- Pin-point feedback on files
-- =====================================================
CREATE TABLE IF NOT EXISTS public.annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_file_id UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  
  -- Who left the comment
  author_type TEXT NOT NULL CHECK (author_type IN ('client', 'designer')),
  author_name TEXT NOT NULL,
  
  -- Pin location (percentage of image dimensions for responsive positioning)
  x_position NUMERIC NOT NULL CHECK (x_position >= 0 AND x_position <= 100),
  y_position NUMERIC NOT NULL CHECK (y_position >= 0 AND y_position <= 100),
  
  -- Comment content
  comment TEXT NOT NULL,
  
  -- Status: open, resolved
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can manage their own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view projects by portal token"
  ON public.projects FOR SELECT
  USING (portal_token IS NOT NULL);

-- Project files policies
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

-- Annotations policies
CREATE POLICY "Users can manage annotations on their project files"
  ON public.annotations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      WHERE pf.id = annotations.project_file_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view and insert annotations"
  ON public.annotations FOR SELECT
  USING (true);

CREATE POLICY "Public can add annotations to accessible files"
  ON public.annotations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      WHERE pf.id = project_file_id
      AND p.portal_token IS NOT NULL
    )
  );

-- =====================================================
-- 5. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_portal_token ON public.projects(portal_token);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_version ON public.project_files(project_id, version);
CREATE INDEX IF NOT EXISTS idx_annotations_file_id ON public.annotations(project_file_id);
CREATE INDEX IF NOT EXISTS idx_annotations_status ON public.annotations(status);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- Auto-archive previous versions when new version uploaded
CREATE OR REPLACE FUNCTION archive_previous_file_versions()
RETURNS TRIGGER AS $$
BEGIN
  -- Set all other versions of the same project to is_current = false
  UPDATE public.project_files
  SET is_current = false
  WHERE project_id = NEW.project_id
    AND id != NEW.id
    AND is_current = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER archive_versions_on_insert
  AFTER INSERT ON public.project_files
  FOR EACH ROW
  WHEN (NEW.is_current = true)
  EXECUTE FUNCTION archive_previous_file_versions();

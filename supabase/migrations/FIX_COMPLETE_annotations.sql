-- =====================================================
-- COMPLETE FIX: Drop and recreate annotations table
-- =====================================================

-- First, drop the table if it exists
DROP TABLE IF EXISTS public.annotations CASCADE;

-- Now create the table fresh
CREATE TABLE public.annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_file_id UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  
  author_type TEXT NOT NULL CHECK (author_type IN ('client', 'designer')),
  author_name TEXT NOT NULL,
  
  x_position NUMERIC NOT NULL CHECK (x_position >= 0 AND x_position <= 100),
  y_position NUMERIC NOT NULL CHECK (y_position >= 0 AND y_position <= 100),
  
  comment TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Indexes
CREATE INDEX idx_annotations_file_id ON public.annotations(project_file_id);

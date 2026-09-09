-- Add a separate image for the urgent requirement detail page.
ALTER TABLE public.urgent_requirements
  ADD COLUMN IF NOT EXISTS detail_image_url TEXT;

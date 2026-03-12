-- ============================================================
-- Migration 007: Admin setup
-- 1. Set vasileios@koinis.gr as admin
-- 2. Add admin_notes column to contact_inquiries
-- ============================================================

-- Set admin role (runs against profiles which is linked to auth.users)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'vasileios@koinis.gr';

-- Add admin_notes to contact_inquiries if not present
ALTER TABLE public.contact_inquiries
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

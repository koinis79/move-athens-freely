
-- Admin notifications table
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  link text DEFAULT '/admin',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notifications"
  ON public.admin_notifications FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert some initial notifications
INSERT INTO public.admin_notifications (message, type, link, is_read) VALUES
  ('Welcome to the admin dashboard! All systems operational.', 'info', '/admin', false);

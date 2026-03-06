-- Drop the existing permissive UPDATE policy that allows role self-escalation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a restrictive UPDATE policy that prevents users from changing their own role
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
);
-- Fix RLS Policy for project_members to allow project owners to add first member
-- Run this in Supabase SQL Editor to fix the RLS issue

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Project admins can insert members" ON project_members;

-- Create a new policy that allows:
-- 1. Project owners to add members (for initial setup)
-- 2. Project admins to add members (for ongoing management)
CREATE POLICY "Project owners and admins can insert members"
  ON project_members FOR INSERT
  WITH CHECK (
    -- Allow if user is the project owner
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
    OR
    -- Allow if user is already an admin of the project
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'admin'
    )
  );

/*
  # Add Storage and Functions for Carbon Credit System

  1. Functions
    - Add carbon credits function for admin use
    - Update user premium status
    
  2. Storage
    - Create bucket for evidence uploads
*/

-- Function to add carbon credits to a user
CREATE OR REPLACE FUNCTION add_carbon_credits(
  user_id uuid,
  amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET carbon_credits = carbon_credits + amount
  WHERE id = user_id;
END;
$$;

-- Function to update user premium status
CREATE OR REPLACE FUNCTION update_premium_status(
  user_id uuid,
  is_premium boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET is_premium = update_premium_status.is_premium
  WHERE id = user_id;
END;
$$;

-- Create storage bucket for evidence
INSERT INTO storage.buckets (id, name)
VALUES ('evidence', 'evidence')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view evidence"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'evidence');

CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');
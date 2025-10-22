-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_earned NUMERIC DEFAULT 0,
  first_investment_made BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referred_id)
);

-- Add referral_code to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate referral codes for existing users
UPDATE public.profiles 
SET referral_code = SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)
WHERE referral_code IS NULL;

-- Add referred_by to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (true);

-- Function to generate referral code on user creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-generate referral code
DROP TRIGGER IF EXISTS generate_referral_code_trigger ON public.profiles;
CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION generate_referral_code();
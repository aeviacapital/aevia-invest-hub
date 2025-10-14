-- Create loans table with comprehensive fields
CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  principal_amount numeric NOT NULL,
  interest_rate numeric NOT NULL,
  loan_term_months integer NOT NULL,
  repayment_schedule text NOT NULL,
  collateral text,
  credit_requirements text,
  fees_charges numeric DEFAULT 0,
  loan_agreement text,
  loan_type text NOT NULL,
  disbursement_details text,
  default_terms text,
  status text DEFAULT 'pending',
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on loans table
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Users can view their own loans
CREATE POLICY "Users can view their own loans"
ON public.loans FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all loans
CREATE POLICY "Admins can manage all loans"
ON public.loans FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Remove demo_balance from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS demo_balance;

-- Add trigger for loans updated_at
CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fix profiles RLS - Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Allow admins to update any profile (for balance control)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update any trade (for P&L control)
CREATE POLICY "Admins can manage all trades"
ON public.trades FOR ALL
USING (has_role(auth.uid(), 'admin'));
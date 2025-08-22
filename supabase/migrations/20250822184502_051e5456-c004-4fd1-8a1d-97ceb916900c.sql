-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON public.kyc_documents;
DROP TRIGGER IF EXISTS update_investment_plans_updated_at ON public.investment_plans;
DROP TRIGGER IF EXISTS update_user_investments_updated_at ON public.user_investments;
DROP TRIGGER IF EXISTS update_trader_profiles_updated_at ON public.trader_profiles;
DROP TRIGGER IF EXISTS update_copy_trading_updated_at ON public.copy_trading;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate functions with proper security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON public.kyc_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_investment_plans_updated_at BEFORE UPDATE ON public.investment_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_investments_updated_at BEFORE UPDATE ON public.user_investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trader_profiles_updated_at BEFORE UPDATE ON public.trader_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_copy_trading_updated_at BEFORE UPDATE ON public.copy_trading FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
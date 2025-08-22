-- Insert sample investment plans
INSERT INTO public.investment_plans (title, description, investment_type, min_deposit, expected_return_min, expected_return_max, duration_months, risk_level, features) VALUES
('Premium Real Estate', 'Diversified real estate portfolio with prime commercial and residential properties', 'real_estate', 10000.00, 12.00, 18.00, 12, 'medium', ARRAY['Prime locations', 'Professional management', 'Quarterly returns', 'Exit flexibility']),
('Oil & Gas Ventures', 'Strategic investments in established oil fields and gas exploration projects', 'oil_gas', 25000.00, 15.00, 25.00, 18, 'high', ARRAY['Proven reserves', 'Industry expertise', 'Market hedging', 'High yield potential']),
('Elite Real Estate Fund', 'Luxury property investments in high-growth metropolitan areas', 'real_estate', 50000.00, 18.00, 28.00, 24, 'high', ARRAY['Luxury properties', 'Prime markets', 'Capital appreciation', 'Rental income']);

-- Insert sample trader profiles
INSERT INTO public.trader_profiles (username, avatar_url, bio, total_trades, winning_trades, roi_percentage, min_copy_amount, max_copy_amount, followers_count) VALUES
('CryptoKing_Pro', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Professional crypto trader with 5+ years experience. Specialized in BTC/ETH swing trading.', 1247, 798, 24.8, 100.00, 5000.00, 234),
('ForexMaster_Elite', 'https://images.unsplash.com/photo-1494790108755-2616b88ea2c7?w=150&h=150&fit=crop&crop=face', 'Elite forex trader focusing on major pairs. Conservative approach with consistent profits.', 892, 634, 18.6, 250.00, 10000.00, 156),
('TradingLegend_88', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Multi-asset trader specializing in crypto and forex. High-frequency trading strategies.', 2156, 1512, 32.4, 500.00, 15000.00, 412);

-- Insert sample invitation codes
INSERT INTO public.invitation_codes (code, expires_at) VALUES
('WELCOME2024', now() + interval '30 days'),
('INVEST2024', now() + interval '30 days'),
('TRADE2024', now() + interval '30 days');
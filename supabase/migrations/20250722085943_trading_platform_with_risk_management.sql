-- Trading Platform Risk Management Schema
-- Location: supabase/migrations/20250722085943_trading_platform_with_risk_management.sql

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'trader', 'analyst', 'viewer');
CREATE TYPE public.strategy_type AS ENUM ('bullish', 'bearish', 'neutral', 'hedging');
CREATE TYPE public.strategy_status AS ENUM ('active', 'closed', 'paused', 'deployed');
CREATE TYPE public.leg_type AS ENUM ('CALL', 'PUT', 'STOCK', 'FUTURE');
CREATE TYPE public.alert_type AS ENUM ('sl_hit', 'tp_hit', 'margin_breach', 'iv_spike', 'gap_risk', 'system');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- 2. Core Tables

-- User profiles table (intermediary between auth.users and business logic)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'trader'::public.user_role,
    max_capital DECIMAL(15,2) DEFAULT 500000,
    max_risk_per_trade DECIMAL(15,2) DEFAULT 50000,
    risk_tolerance public.risk_level DEFAULT 'medium'::public.risk_level,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trading strategies
CREATE TABLE public.trading_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    strategy_type public.strategy_type NOT NULL,
    status public.strategy_status DEFAULT 'active'::public.strategy_status,
    underlying_symbol TEXT NOT NULL,
    underlying_price DECIMAL(10,2),
    expiry_date DATE,
    
    -- Risk Parameters
    max_loss DECIMAL(12,2),
    max_profit DECIMAL(12,2),
    stop_loss DECIMAL(12,2),
    take_profit DECIMAL(12,2),
    sl_enabled BOOLEAN DEFAULT false,
    tp_enabled BOOLEAN DEFAULT false,
    trailing_sl_enabled BOOLEAN DEFAULT false,
    
    -- Current Metrics
    current_pnl DECIMAL(12,2) DEFAULT 0,
    total_margin DECIMAL(12,2) DEFAULT 0,
    delta DECIMAL(8,4) DEFAULT 0,
    gamma DECIMAL(8,4) DEFAULT 0,
    theta DECIMAL(8,4) DEFAULT 0,
    vega DECIMAL(8,4) DEFAULT 0,
    iv DECIMAL(6,3) DEFAULT 0,
    
    -- Risk Scores
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    capital_at_risk DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Strategy legs (individual option positions)
CREATE TABLE public.strategy_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.trading_strategies(id) ON DELETE CASCADE,
    leg_name TEXT NOT NULL,
    leg_type public.leg_type NOT NULL,
    strike_price DECIMAL(10,2),
    quantity INTEGER NOT NULL,
    premium DECIMAL(8,2),
    is_long BOOLEAN DEFAULT true,
    
    -- Risk Metrics per leg
    leg_delta DECIMAL(8,4) DEFAULT 0,
    leg_gamma DECIMAL(8,4) DEFAULT 0,
    leg_theta DECIMAL(8,4) DEFAULT 0,
    leg_vega DECIMAL(8,4) DEFAULT 0,
    leg_pnl DECIMAL(10,2) DEFAULT 0,
    leg_margin DECIMAL(10,2) DEFAULT 0,
    
    -- Risk Attribution
    risk_contribution DECIMAL(6,3) DEFAULT 0,
    risk_rank INTEGER DEFAULT 0,
    risk_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Risk alerts and notifications
CREATE TABLE public.risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.trading_strategies(id) ON DELETE SET NULL,
    alert_type public.alert_type NOT NULL,
    severity public.alert_severity NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_value TEXT,
    is_read BOOLEAN DEFAULT false,
    is_cleared BOOLEAN DEFAULT false,
    triggered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ
);

-- SL/TP execution history
CREATE TABLE public.sl_tp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.trading_strategies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'sl_triggered', 'tp_triggered', 'sl_modified', 'tp_modified', 'sl_enabled', 'sl_disabled'
    old_value DECIMAL(12,2),
    new_value DECIMAL(12,2),
    trigger_price DECIMAL(10,2),
    execution_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio risk metrics (aggregated)
CREATE TABLE public.portfolio_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    total_pnl DECIMAL(15,2) DEFAULT 0,
    total_margin DECIMAL(15,2) DEFAULT 0,
    total_delta DECIMAL(10,4) DEFAULT 0,
    total_gamma DECIMAL(10,4) DEFAULT 0,
    total_theta DECIMAL(10,4) DEFAULT 0,
    total_vega DECIMAL(10,4) DEFAULT 0,
    capital_at_risk DECIMAL(15,2) DEFAULT 0,
    portfolio_risk_score INTEGER DEFAULT 0 CHECK (portfolio_risk_score >= 0 AND portfolio_risk_score <= 100),
    margin_utilization DECIMAL(5,2) DEFAULT 0,
    active_strategies_count INTEGER DEFAULT 0,
    snapshot_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Auto-hedger configurations
CREATE TABLE public.auto_hedger_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.trading_strategies(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT false,
    trigger_delta DECIMAL(6,3),
    trigger_pnl_loss DECIMAL(12,2),
    hedge_type TEXT, -- 'delta_hedge', 'protective_put', 'collar'
    auto_execute BOOLEAN DEFAULT false,
    max_hedge_cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Market data cache
CREATE TABLE public.market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    change_percent DECIMAL(5,2) DEFAULT 0,
    volume BIGINT DEFAULT 0,
    open_interest BIGINT DEFAULT 0,
    vix DECIMAL(6,3),
    pcr DECIMAL(6,3),
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes for Performance
CREATE INDEX idx_trading_strategies_user_id ON public.trading_strategies(user_id);
CREATE INDEX idx_trading_strategies_status ON public.trading_strategies(status);
CREATE INDEX idx_trading_strategies_underlying ON public.trading_strategies(underlying_symbol);
CREATE INDEX idx_strategy_legs_strategy_id ON public.strategy_legs(strategy_id);
CREATE INDEX idx_strategy_legs_risk_rank ON public.strategy_legs(risk_rank);
CREATE INDEX idx_risk_alerts_user_id ON public.risk_alerts(user_id);
CREATE INDEX idx_risk_alerts_unread ON public.risk_alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_sl_tp_history_strategy ON public.sl_tp_history(strategy_id, created_at);
CREATE INDEX idx_portfolio_metrics_user_snapshot ON public.portfolio_metrics(user_id, snapshot_at);
CREATE INDEX idx_market_data_symbol ON public.market_data(symbol);
CREATE UNIQUE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- 4. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sl_tp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_hedger_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- 5. Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
)
$$;

CREATE OR REPLACE FUNCTION public.owns_strategy(strategy_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.trading_strategies ts
    WHERE ts.id = strategy_uuid AND ts.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.can_access_leg(leg_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.strategy_legs sl
    JOIN public.trading_strategies ts ON sl.strategy_id = ts.id
    WHERE sl.id = leg_uuid AND ts.user_id = auth.uid()
)
$$;

-- 6. RLS Policies
-- User profiles
CREATE POLICY "users_own_profile" ON public.user_profiles
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trading strategies
CREATE POLICY "users_manage_own_strategies" ON public.trading_strategies
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_view_all_strategies" ON public.trading_strategies
FOR SELECT USING (public.is_admin());

-- Strategy legs
CREATE POLICY "users_access_own_legs" ON public.strategy_legs
FOR ALL USING (public.can_access_leg(id)) WITH CHECK (public.can_access_leg(id));

-- Risk alerts
CREATE POLICY "users_own_alerts" ON public.risk_alerts
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SL/TP history
CREATE POLICY "users_own_sl_tp_history" ON public.sl_tp_history
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Portfolio metrics
CREATE POLICY "users_own_portfolio_metrics" ON public.portfolio_metrics
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Auto-hedger config
CREATE POLICY "users_own_hedger_config" ON public.auto_hedger_config
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Market data (public read access)
CREATE POLICY "public_market_data_read" ON public.market_data
FOR SELECT TO authenticated USING (true);

CREATE POLICY "admins_manage_market_data" ON public.market_data
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Risk Calculation Functions

-- Calculate strategy risk score
CREATE OR REPLACE FUNCTION public.calculate_strategy_risk_score(strategy_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    risk_score INTEGER := 0;
    strategy_rec RECORD;
    sl_proximity DECIMAL;
    margin_ratio DECIMAL;
    greek_stability DECIMAL;
BEGIN
    SELECT * INTO strategy_rec
    FROM public.trading_strategies
    WHERE id = strategy_uuid;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- SL proximity (0-40 points)
    IF strategy_rec.sl_enabled AND strategy_rec.stop_loss IS NOT NULL THEN
        sl_proximity := ABS(strategy_rec.current_pnl - strategy_rec.stop_loss) / 
                       NULLIF(ABS(strategy_rec.stop_loss), 0);
        risk_score := risk_score + LEAST(40, GREATEST(0, 40 - (sl_proximity * 20)::INTEGER));
    ELSE
        risk_score := risk_score + 30; -- No SL is risky
    END IF;
    
    -- Margin usage (0-30 points)
    SELECT max_capital INTO margin_ratio FROM public.user_profiles WHERE id = strategy_rec.user_id;
    IF margin_ratio > 0 THEN
        margin_ratio := strategy_rec.total_margin / margin_ratio;
        risk_score := risk_score + (margin_ratio * 30)::INTEGER;
    END IF;
    
    -- Greeks stability (0-30 points)
    greek_stability := (ABS(strategy_rec.delta) + ABS(strategy_rec.gamma) * 10 + ABS(strategy_rec.vega) / 10);
    risk_score := risk_score + LEAST(30, (greek_stability * 2)::INTEGER);
    
    RETURN LEAST(100, risk_score);
END;
$$;

-- Risk attribution per leg
CREATE OR REPLACE FUNCTION public.calculate_leg_risk_attribution(strategy_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    leg_rec RECORD;
    total_risk DECIMAL := 0;
    leg_risk DECIMAL;
BEGIN
    -- Calculate total risk first
    FOR leg_rec IN
        SELECT id, ABS(leg_delta) + ABS(leg_gamma) * 10 + ABS(leg_vega) / 10 + ABS(leg_pnl) / 1000 as risk_value
        FROM public.strategy_legs
        WHERE strategy_id = strategy_uuid
    LOOP
        total_risk := total_risk + leg_rec.risk_value;
    END LOOP;
    
    -- Update each leg with risk contribution and ranking
    FOR leg_rec IN
        SELECT id, leg_name, ABS(leg_delta) + ABS(leg_gamma) * 10 + ABS(leg_vega) / 10 + ABS(leg_pnl) / 1000 as risk_value
        FROM public.strategy_legs
        WHERE strategy_id = strategy_uuid
        ORDER BY risk_value DESC
    LOOP
        leg_risk := CASE 
            WHEN total_risk > 0 THEN (leg_rec.risk_value / total_risk) * 100
            ELSE 0
        END;
        
        UPDATE public.strategy_legs
        SET 
            risk_contribution = leg_risk,
            risk_rank = (SELECT COUNT(*) + 1 FROM public.strategy_legs sl2 
                        WHERE sl2.strategy_id = strategy_uuid 
                        AND (ABS(sl2.leg_delta) + ABS(sl2.leg_gamma) * 10 + ABS(sl2.leg_vega) / 10 + ABS(sl2.leg_pnl) / 1000) > leg_rec.risk_value),
            risk_reason = CASE 
                WHEN leg_risk > 40 THEN 'High Risk Concentration'
                WHEN ABS((SELECT leg_delta FROM public.strategy_legs WHERE id = leg_rec.id)) > 0.5 THEN 'High Delta Exposure'
                WHEN ABS((SELECT leg_gamma FROM public.strategy_legs WHERE id = leg_rec.id)) > 0.1 THEN 'High Gamma Risk'
                WHEN ABS((SELECT leg_vega FROM public.strategy_legs WHERE id = leg_rec.id)) > 20 THEN 'High Vega Risk' ELSE'Normal Risk'
            END
        WHERE id = leg_rec.id;
    END LOOP;
END;
$$;

-- Portfolio risk aggregator
CREATE OR REPLACE FUNCTION public.aggregate_portfolio_risk(user_uuid UUID)
RETURNS TABLE(
    total_pnl DECIMAL,
    total_margin DECIMAL,
    total_delta DECIMAL,
    total_gamma DECIMAL,
    total_theta DECIMAL,
    total_vega DECIMAL,
    portfolio_risk_score INTEGER,
    active_strategies INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(ts.current_pnl), 0)::DECIMAL as total_pnl,
        COALESCE(SUM(ts.total_margin), 0)::DECIMAL as total_margin,
        COALESCE(SUM(ts.delta), 0)::DECIMAL as total_delta,
        COALESCE(SUM(ts.gamma), 0)::DECIMAL as total_gamma,
        COALESCE(SUM(ts.theta), 0)::DECIMAL as total_theta,
        COALESCE(SUM(ts.vega), 0)::DECIMAL as total_vega,
        COALESCE(AVG(ts.risk_score), 0)::INTEGER as portfolio_risk_score,
        COUNT(*)::INTEGER as active_strategies
    FROM public.trading_strategies ts
    WHERE ts.user_id = user_uuid 
    AND ts.status = 'active'::public.strategy_status;
END;
$$;

-- Auto user profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'trader')::public.user_role
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    trader1_uuid UUID := gen_random_uuid();
    trader2_uuid UUID := gen_random_uuid();
    strategy1_uuid UUID := gen_random_uuid();
    strategy2_uuid UUID := gen_random_uuid();
    strategy3_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@tradingrisk.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Risk Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (trader1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'john.trader@example.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Trader", "role": "trader"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (trader2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'sarah.analyst@example.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sarah Analyst", "role": "analyst"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create trading strategies
    INSERT INTO public.trading_strategies (
        id, user_id, name, strategy_type, status, underlying_symbol, underlying_price,
        expiry_date, max_loss, max_profit, stop_loss, take_profit, sl_enabled, tp_enabled,
        current_pnl, total_margin, delta, gamma, theta, vega, iv, risk_score, capital_at_risk
    ) VALUES
        (strategy1_uuid, trader1_uuid, 'Iron Condor NIFTY', 'neutral'::public.strategy_type, 'active'::public.strategy_status,
         'NIFTY', 20045.75, '2025-01-30', 5000, 12000, 5000, 12000, true, true,
         8750, 45000, -0.15, 0.08, 45.2, -12.8, 16.5, 45, 45000),
        (strategy2_uuid, trader1_uuid, 'Bull Call Spread', 'bullish'::public.strategy_type, 'active'::public.strategy_status,
         'NIFTY', 20045.75, '2025-01-30', 3000, 7000, 3000, 0, true, false,
         -2340, 25000, 0.45, 0.12, -15.6, 8.2, 18.2, 72, 25000),
        (strategy3_uuid, trader2_uuid, 'Short Straddle', 'neutral'::public.strategy_type, 'active'::public.strategy_status,
         'BANKNIFTY', 44256.30, '2025-01-30', 8000, 15000, 8000, 15000, true, true,
         12450, 75000, 0.02, -0.18, 85.4, -25.6, 22.1, 85, 75000);

    -- Create strategy legs
    INSERT INTO public.strategy_legs (
        strategy_id, leg_name, leg_type, strike_price, quantity, premium, is_long,
        leg_delta, leg_gamma, leg_theta, leg_vega, leg_pnl, leg_margin
    ) VALUES
        -- Iron Condor legs
        (strategy1_uuid, 'Long Put', 'PUT'::public.leg_type, 19800, 50, 85, true, -0.25, 0.02, 5.2, -2.8, 2250, 4250),
        (strategy1_uuid, 'Short Put', 'PUT'::public.leg_type, 19900, -50, 125, false, -0.35, 0.03, 8.5, -4.2, -1500, 15000),
        (strategy1_uuid, 'Short Call', 'CALL'::public.leg_type, 20100, -50, 135, false, 0.30, 0.02, 12.5, -3.8, 3200, 18000),
        (strategy1_uuid, 'Long Call', 'CALL'::public.leg_type, 20200, 50, 95, true, 0.20, 0.01, 8.0, -2.0, -1200, 7750),
        
        -- Bull Call Spread legs
        (strategy2_uuid, 'Long Call', 'CALL'::public.leg_type, 20000, 100, 150, true, 0.60, 0.08, -8.5, 5.2, -1200, 15000),
        (strategy2_uuid, 'Short Call', 'CALL'::public.leg_type, 20100, -100, 95, false, 0.35, 0.04, -7.1, 3.0, -1140, 10000),
        
        -- Short Straddle legs
        (strategy3_uuid, 'Short Call', 'CALL'::public.leg_type, 44000, -75, 180, false, 0.45, -0.10, 42.5, -12.8, 6750, 37500),
        (strategy3_uuid, 'Short Put', 'PUT'::public.leg_type, 44000, -75, 165, false, -0.43, -0.08, 42.9, -12.8, 5700, 37500);

    -- Calculate risk attribution for all strategies
    PERFORM public.calculate_leg_risk_attribution(strategy1_uuid);
    PERFORM public.calculate_leg_risk_attribution(strategy2_uuid);
    PERFORM public.calculate_leg_risk_attribution(strategy3_uuid);

    -- Create risk alerts
    INSERT INTO public.risk_alerts (
        user_id, strategy_id, alert_type, severity, title, message, alert_value, triggered_at
    ) VALUES
        (trader1_uuid, strategy2_uuid, 'sl_hit'::public.alert_type, 'critical'::public.alert_severity,
         'Stop Loss Triggered', 'Bull Call Spread has hit the stop loss level', '₹3,000', 
         CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
        (trader1_uuid, null, 'margin_breach'::public.alert_type, 'warning'::public.alert_severity,
         'Margin Utilization High', 'Portfolio margin usage exceeded 80%', '85%',
         CURRENT_TIMESTAMP - INTERVAL '10 minutes'),
        (trader2_uuid, strategy3_uuid, 'iv_spike'::public.alert_type, 'info'::public.alert_severity,
         'IV Spike Detected', 'Implied volatility increased significantly in BANKNIFTY options', '+15%',
         CURRENT_TIMESTAMP - INTERVAL '15 minutes');

    -- Create SL/TP history
    INSERT INTO public.sl_tp_history (
        strategy_id, user_id, action_type, old_value, new_value, trigger_price, execution_status
    ) VALUES
        (strategy1_uuid, trader1_uuid, 'sl_enabled', null, 5000, null, 'completed'),
        (strategy2_uuid, trader1_uuid, 'sl_triggered', 3000, 3000, 19950.25, 'executed'),
        (strategy3_uuid, trader2_uuid, 'tp_modified', 12000, 15000, null, 'completed');

    -- Create portfolio metrics snapshots
    INSERT INTO public.portfolio_metrics (
        user_id, total_pnl, total_margin, total_delta, total_gamma, total_theta, total_vega,
        capital_at_risk, portfolio_risk_score, margin_utilization, active_strategies_count
    ) VALUES
        (trader1_uuid, 6410, 70000, 0.30, 0.20, 29.6, -4.6, 70000, 58, 14.0, 2),
        (trader2_uuid, 12450, 75000, 0.02, -0.18, 85.4, -25.6, 75000, 85, 15.0, 1);

    -- Create market data
    INSERT INTO public.market_data (symbol, price, change_percent, volume, open_interest, vix, pcr) VALUES
        ('NIFTY', 20045.75, 0.85, 2400000, 1800000, 16.45, 1.18),
        ('BANKNIFTY', 44256.30, -0.42, 1200000, 950000, 18.20, 1.25),
        ('SENSEX', 66789.12, 1.23, 800000, 400000, null, null);

END $$;

-- 9. Cleanup function for development
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs for test data
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@example.com' OR email LIKE '%@tradingrisk.com';

    -- Delete in dependency order
    DELETE FROM public.risk_alerts WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.sl_tp_history WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.portfolio_metrics WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.auto_hedger_config WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.strategy_legs WHERE strategy_id IN (SELECT id FROM public.trading_strategies WHERE user_id = ANY(auth_user_ids_to_delete));
    DELETE FROM public.trading_strategies WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;
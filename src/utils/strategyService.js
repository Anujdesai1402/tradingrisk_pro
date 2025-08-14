import { supabase } from './supabaseClient';

class StrategyService {
  // Get all strategies for a user
  async getUserStrategies(userId, status = 'active') {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select(`
          *,
          strategy_legs(*)
        `)
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform data for frontend consumption
      const strategies = data.map(strategy => ({
        ...strategy,
        legs: strategy.strategy_legs,
        pnlChange: this.calculatePnlChange(strategy),
        lastUpdated: this.formatLastUpdated(strategy.updated_at)
      }));

      return { success: true, data: strategies };
    } catch (error) {
      return { success: false, error: 'Failed to fetch strategies' };
    }
  }

  // Get single strategy with full details
  async getStrategy(strategyId) {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select(`
          *,
          strategy_legs(*),
          user_profiles(full_name, max_capital)
        `)
        .eq('id', strategyId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to fetch strategy details' };
    }
  }

  // Create new strategy
  async createStrategy(userId, strategyData) {
    try {
      const { data: strategy, error: strategyError } = await supabase
        .from('trading_strategies')
        .insert({
          user_id: userId,
          name: strategyData.name,
          strategy_type: strategyData.type,
          underlying_symbol: strategyData.underlying,
          underlying_price: strategyData.underlyingPrice,
          expiry_date: strategyData.expiryDate,
          max_loss: strategyData.maxLoss,
          max_profit: strategyData.maxProfit,
          stop_loss: strategyData.stopLoss,
          take_profit: strategyData.takeProfit,
          sl_enabled: strategyData.slEnabled,
          tp_enabled: strategyData.tpEnabled,
          total_margin: strategyData.totalMargin,
          risk_score: strategyData.riskScore || 50
        })
        .select()
        .single();

      if (strategyError) {
        return { success: false, error: strategyError.message };
      }

      // Insert strategy legs if provided
      if (strategyData.legs && strategyData.legs.length > 0) {
        const legs = strategyData.legs.map(leg => ({
          strategy_id: strategy.id,
          leg_name: leg.name,
          leg_type: leg.type,
          strike_price: leg.strike,
          quantity: leg.quantity,
          premium: leg.premium,
          is_long: leg.isLong,
          leg_delta: leg.delta || 0,
          leg_gamma: leg.gamma || 0,
          leg_theta: leg.theta || 0,
          leg_vega: leg.vega || 0,
          leg_margin: leg.margin || 0
        }));

        const { error: legsError } = await supabase
          .from('strategy_legs')
          .insert(legs);

        if (legsError) {
          return { success: false, error: legsError.message };
        }
      }

      return { success: true, data: strategy };
    } catch (error) {
      return { success: false, error: 'Failed to create strategy' };
    }
  }

  // Update strategy
  async updateStrategy(strategyId, updates) {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', strategyId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update strategy' };
    }
  }

  // Close strategy
  async closeStrategy(strategyId) {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', strategyId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to close strategy' };
    }
  }

  // Update strategy Greeks and PnL (real-time updates)
  async updateStrategyMetrics(strategyId, metrics) {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .update({
          current_pnl: metrics.pnl,
          delta: metrics.delta,
          gamma: metrics.gamma,
          theta: metrics.theta,
          vega: metrics.vega,
          iv: metrics.iv,
          updated_at: new Date().toISOString()
        })
        .eq('id', strategyId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update strategy metrics' };
    }
  }

  // Get payoff data for chart visualization
  async getPayoffData(strategyId, priceRange = { min: 0.8, max: 1.2 }) {
    try {
      const { data: strategy, error } = await supabase
        .from('trading_strategies')
        .select(`
          *,
          strategy_legs(*)
        `)
        .eq('id', strategyId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Calculate payoff points
      const underlyingPrice = strategy.underlying_price;
      const minPrice = underlyingPrice * priceRange.min;
      const maxPrice = underlyingPrice * priceRange.max;
      const steps = 100;
      const stepSize = (maxPrice - minPrice) / steps;

      const payoffPoints = [];
      
      for (let i = 0; i <= steps; i++) {
        const spotPrice = minPrice + (i * stepSize);
        let totalPayoff = 0;
        
        // Calculate payoff for each leg
        strategy.strategy_legs.forEach(leg => {
          const legPayoff = this.calculateLegPayoff(leg, spotPrice, underlyingPrice);
          totalPayoff += legPayoff;
        });
        
        payoffPoints.push({
          spotPrice: Math.round(spotPrice * 100) / 100,
          payoff: Math.round(totalPayoff * 100) / 100,
          pnl: Math.round((totalPayoff - strategy.current_pnl) * 100) / 100
        });
      }

      // Add key price levels
      const keyLevels = {
        currentSpot: underlyingPrice,
        breakevens: this.calculateBreakevens(strategy),
        maxProfit: strategy.max_profit,
        maxLoss: -Math.abs(strategy.max_loss),
        strikes: strategy.strategy_legs.map(leg => leg.strike_price).filter(Boolean)
      };

      return { 
        success: true, 
        data: {
          strategy: {
            id: strategy.id,
            name: strategy.name,
            underlying: strategy.underlying_symbol,
            currentPnl: strategy.current_pnl
          },
          payoffPoints,
          keyLevels,
          expiryDate: strategy.expiry_date
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to calculate payoff data' };
    }
  }

  // Real-time strategy updates via WebSocket
  subscribeToStrategyUpdates(userId, callback) {
    return supabase
      .channel('strategy_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trading_strategies',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  // Helper methods
  calculatePnlChange(strategy) {
    // Simplified calculation - in real app would compare with previous values
    const timeAgo = new Date() - new Date(strategy.updated_at);
    const hoursAgo = timeAgo / (1000 * 60 * 60);
    
    // Simulate some change based on time and randomness
    return (Math.random() - 0.5) * 5; // Random change between -2.5 and +2.5
  }

  formatLastUpdated(timestamp) {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMinutes = Math.floor((now - updated) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  calculateLegPayoff(leg, spotPrice, currentSpot) {
    const { leg_type, strike_price, quantity, premium, is_long } = leg;
    let payoff = 0;
    
    if (leg_type === 'CALL') {
      const intrinsicValue = Math.max(0, spotPrice - strike_price);
      payoff = intrinsicValue - premium;
    } else if (leg_type === 'PUT') {
      const intrinsicValue = Math.max(0, strike_price - spotPrice);
      payoff = intrinsicValue - premium;
    } else if (leg_type === 'STOCK') {
      payoff = spotPrice - currentSpot;
    }
    
    // Adjust for long/short position
    payoff = is_long ? payoff : -payoff;
    
    // Multiply by quantity
    return payoff * Math.abs(quantity);
  }

  calculateBreakevens(strategy) {
    // Simplified breakeven calculation
    // In real implementation, would solve for payoff = 0
    const strikes = strategy.strategy_legs
      .map(leg => leg.strike_price)
      .filter(Boolean)
      .sort((a, b) => a - b);
    
    if (strikes.length >= 2) {
      return [strikes[0] - 50, strikes[strikes.length - 1] + 50];
    }
    
    return [strategy.underlying_price * 0.95, strategy.underlying_price * 1.05];
  }
}

export default new StrategyService();
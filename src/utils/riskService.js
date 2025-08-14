import { supabase } from './supabaseClient';

class RiskService {
  // Risk Attribution Engine - Get risk analysis for strategy legs
  async getRiskAttribution(strategyId) {
    try {
      const { data, error } = await supabase
        .from('strategy_legs')
        .select(`
          *,
          trading_strategies!inner(name, underlying_symbol)
        `)
        .eq('strategy_id', strategyId)
        .order('risk_rank', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      // Process risk attribution data
      const riskAnalysis = {
        strategyId,
        strategyName: data[0]?.trading_strategies?.name,
        underlying: data[0]?.trading_strategies?.underlying_symbol,
        totalLegs: data.length,
        riskiestLegs: data.slice(0, 3), // Top 3 riskiest
        riskDistribution: data.map(leg => ({
          legName: leg.leg_name,
          riskContribution: leg.risk_contribution,
          riskRank: leg.risk_rank,
          riskReason: leg.risk_reason,
          metrics: {
            delta: leg.leg_delta,
            gamma: leg.leg_gamma,
            theta: leg.leg_theta,
            vega: leg.leg_vega,
            pnl: leg.leg_pnl,
            margin: leg.leg_margin
          }
        }))
      };

      return { success: true, data: riskAnalysis };
    } catch (error) {
      return { success: false, error: 'Failed to fetch risk attribution' };
    }
  }

  // Max Loss Limiter - Validate strategy against max loss threshold
  async validateMaxLoss(strategyConfig, maxAllowedLoss) {
    try {
      const { data, error } = await supabase.rpc('calculate_strategy_risk_score', {
        strategy_uuid: strategyConfig.id
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const currentMaxLoss = strategyConfig.max_loss || 0;
      const potentialLoss = Math.max(currentMaxLoss, strategyConfig.total_margin * 0.1);

      const validation = {
        isValid: potentialLoss <= maxAllowedLoss,
        currentMaxLoss,
        allowedMaxLoss: maxAllowedLoss,
        potentialLoss,
        riskScore: data,
        recommendations: []
      };

      if (!validation.isValid) {
        validation.recommendations.push(
          'Consider reducing position size',
          'Add protective options to limit downside',
          'Set tighter stop loss levels',
          'Use hedging strategies like protective puts'
        );
      }

      return { success: true, data: validation };
    } catch (error) {
      return { success: false, error: 'Failed to validate max loss' };
    }
  }

  // Dynamic Alerts Engine - Get active alerts for user
  async getActiveAlerts(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('risk_alerts')
        .select(`
          *,
          trading_strategies(name)
        `)
        .eq('user_id', userId)
        .eq('is_cleared', false)
        .order('triggered_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to fetch alerts' };
    }
  }

  // Create new risk alert
  async createAlert(userId, alertData) {
    try {
      const { data, error } = await supabase
        .from('risk_alerts')
        .insert({
          user_id: userId,
          strategy_id: alertData.strategyId,
          alert_type: alertData.type,
          severity: alertData.severity,
          title: alertData.title,
          message: alertData.message,
          alert_value: alertData.value,
          triggered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create alert' };
    }
  }

  // SL/TP History - Get execution history
  async getSlTpHistory(strategyId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('sl_tp_history')
        .select(`
          *,
          trading_strategies(name),
          user_profiles(full_name)
        `)
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to fetch SL/TP history' };
    }
  }

  // Log SL/TP action
  async logSlTpAction(userId, strategyId, actionData) {
    try {
      const { data, error } = await supabase
        .from('sl_tp_history')
        .insert({
          strategy_id: strategyId,
          user_id: userId,
          action_type: actionData.actionType,
          old_value: actionData.oldValue,
          new_value: actionData.newValue,
          trigger_price: actionData.triggerPrice,
          execution_status: actionData.status || 'pending',
          notes: actionData.notes
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to log SL/TP action' };
    }
  }

  // Global Risk Profile Score - Calculate portfolio risk score
  async getPortfolioRiskScore(userId) {
    try {
      const { data, error } = await supabase.rpc('aggregate_portfolio_risk', {
        user_uuid: userId
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const portfolioRisk = data[0];
      
      // Calculate additional risk metrics
      const riskBreakdown = {
        slProximity: await this.calculateSlProximity(userId),
        marginUsage: await this.calculateMarginUsage(userId),
        greeksStability: await this.calculateGreeksStability(userId),
        concentrationRisk: await this.calculateConcentrationRisk(userId)
      };

      const riskProfile = {
        ...portfolioRisk,
        riskBreakdown,
        riskLevel: this.getRiskLevel(portfolioRisk.portfolio_risk_score),
        recommendations: this.getRiskRecommendations(portfolioRisk.portfolio_risk_score)
      };

      return { success: true, data: riskProfile };
    } catch (error) {
      return { success: false, error: 'Failed to calculate portfolio risk score' };
    }
  }

  // Capital-at-Risk Calculator
  async getCapitalAtRisk(strategyId) {
    try {
      const { data: strategy, error } = await supabase
        .from('trading_strategies')
        .select(`
          *,
          strategy_legs(*),
          user_profiles(max_capital)
        `)
        .eq('id', strategyId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const capitalAnalysis = {
        strategyId,
        capitalDeployed: strategy.total_margin,
        maxPotentialLoss: strategy.max_loss || strategy.total_margin,
        currentCapitalAtRisk: strategy.capital_at_risk,
        portfolioPercentage: (strategy.total_margin / strategy.user_profiles.max_capital) * 100,
        legBreakdown: strategy.strategy_legs.map(leg => ({
          legName: leg.leg_name,
          margin: leg.leg_margin,
          potentialLoss: Math.abs(leg.leg_pnl < 0 ? leg.leg_pnl : 0),
          riskContribution: leg.risk_contribution
        })),
        riskMetrics: {
          varEstimate: this.calculateVaR(strategy),
          stressTestLoss: this.calculateStressTestLoss(strategy),
          liquidationRisk: this.calculateLiquidationRisk(strategy)
        }
      };

      return { success: true, data: capitalAnalysis };
    } catch (error) {
      return { success: false, error: 'Failed to calculate capital at risk' };
    }
  }

  // What-If Simulator
  async simulateWhatIf(strategyId, scenarios) {
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

      const simulations = scenarios.map(scenario => {
        const newPrice = strategy.underlying_price * (1 + scenario.spotChange / 100);
        const newIV = strategy.iv * (1 + scenario.ivChange / 100);
        const timeDecay = scenario.timeDecay || 0;

        // Simulate new Greeks and PnL (simplified calculation)
        const simulatedPnl = this.calculateSimulatedPnl(strategy, newPrice, newIV, timeDecay);
        const simulatedGreeks = this.calculateSimulatedGreeks(strategy, newPrice, newIV, timeDecay);

        return {
          scenario: scenario.name,
          inputs: {
            spotChange: scenario.spotChange,
            ivChange: scenario.ivChange,
            timeDecay
          },
          results: {
            newUnderlyingPrice: newPrice,
            newPnl: simulatedPnl,
            pnlChange: simulatedPnl - strategy.current_pnl,
            newGreeks: simulatedGreeks,
            newRiskScore: this.calculateRiskScore(simulatedPnl, simulatedGreeks),
            breachedLimits: this.checkLimitBreaches(strategy, simulatedPnl)
          }
        };
      });

      return { success: true, data: { strategyId, simulations } };
    } catch (error) {
      return { success: false, error: 'Failed to run what-if simulation' };
    }
  }

  // Auto-Hedger Configuration
  async getAutoHedgerConfig(userId, strategyId) {
    try {
      const { data, error } = await supabase
        .from('auto_hedger_config')
        .select('*')
        .eq('user_id', userId)
        .eq('strategy_id', strategyId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        return { success: false, error: error.message };
      }

      return { success: true, data: data || null };
    } catch (error) {
      return { success: false, error: 'Failed to fetch auto-hedger config' };
    }
  }

  async updateAutoHedgerConfig(userId, strategyId, config) {
    try {
      const { data, error } = await supabase
        .from('auto_hedger_config')
        .upsert({
          user_id: userId,
          strategy_id: strategyId,
          ...config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update auto-hedger config' };
    }
  }

  // Helper methods for calculations
  calculateSlProximity(userId) {
    // Calculate how close strategies are to their stop loss levels
    return 15; // Simplified - would calculate based on current PnL vs SL
  }

  calculateMarginUsage(userId) {
    // Calculate margin utilization percentage
    return 45; // Simplified - would calculate based on total margin vs available capital
  }

  calculateGreeksStability(userId) {
    // Calculate Greeks stability score
    return 75; // Simplified - would analyze Greeks volatility over time
  }

  calculateConcentrationRisk(userId) {
    // Calculate concentration risk across positions
    return 30; // Simplified - would analyze position concentration
  }

  getRiskLevel(score) {
    if (score <= 30) return 'low';
    if (score <= 60) return 'medium';
    if (score <= 80) return 'high';
    return 'critical';
  }

  getRiskRecommendations(score) {
    const recommendations = [];
    
    if (score > 70) {
      recommendations.push('Consider reducing position sizes');
      recommendations.push('Review stop loss settings');
      recommendations.push('Add hedging positions');
    } else if (score > 50) {
      recommendations.push('Monitor positions closely');
      recommendations.push('Consider tightening risk limits');
    } else {
      recommendations.push('Portfolio risk is within acceptable limits');
    }

    return recommendations;
  }

  calculateVaR(strategy) {
    // Simplified VaR calculation
    return strategy.total_margin * 0.05; // 5% VaR estimate
  }

  calculateStressTestLoss(strategy) {
    // Stress test scenario loss
    return strategy.total_margin * 0.15; // 15% stress scenario
  }

  calculateLiquidationRisk(strategy) {
    // Calculate likelihood of forced liquidation
    return strategy.total_margin > (strategy.user_profiles?.max_capital * 0.8) ? 'high' : 'low';
  }

  calculateSimulatedPnl(strategy, newPrice, newIV, timeDecay) {
    // Simplified PnL simulation based on delta and vega
    const priceChange = newPrice - strategy.underlying_price;
    const ivChange = newIV - strategy.iv;
    
    return strategy.current_pnl + 
           (strategy.delta * priceChange * 100) + 
           (strategy.vega * ivChange * 10) + 
           (strategy.theta * timeDecay);
  }

  calculateSimulatedGreeks(strategy, newPrice, newIV, timeDecay) {
    // Simplified Greeks simulation
    return {
      delta: strategy.delta * 0.95, // Approximate delta change
      gamma: strategy.gamma * 0.9,
      theta: strategy.theta * (1 - timeDecay / 30),
      vega: strategy.vega * 0.95
    };
  }

  calculateRiskScore(pnl, greeks) {
    // Simplified risk score calculation
    const pnlComponent = Math.abs(pnl) / 10000 * 30;
    const greeksComponent = (Math.abs(greeks.delta) + Math.abs(greeks.gamma) * 10) * 20;
    
    return Math.min(100, pnlComponent + greeksComponent);
  }

  checkLimitBreaches(strategy, simulatedPnl) {
    const breaches = [];
    
    if (strategy.sl_enabled && simulatedPnl <= -Math.abs(strategy.stop_loss)) {
      breaches.push('Stop Loss Breach');
    }
    
    if (strategy.tp_enabled && simulatedPnl >= strategy.take_profit) {
      breaches.push('Take Profit Hit');
    }
    
    return breaches;
  }
}

export default new RiskService();
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userHoldings, fundUniverse } from '../data/mockData';
import { getRatingTier, getTierColor, formatINR } from '../utils/formatters';
import { FundCard } from '../components/FundCard';
import type { Fund, RatingTier, RebalancingModel } from '../types/rebalancer';
import { getReplacements } from '../utils/breEngine';
import { useRebalancerStore } from '../store/rebalancerStore';
import { ArrowLeft, Info, ChevronRight, Zap, X } from 'lucide-react';
import { cn } from '../utils/cn';

const TIERS: RatingTier[] = ['Highly Rated', 'Moderately Rated', 'Need Attention', 'Not Rated'];

interface ModelInfo {
  model: RebalancingModel;
  subtitle: string;
  description: string;
  detail: string;
  color: string;
  icon: string;
}

const MODEL_INFO: ModelInfo[] = [
  {
    model: 'Smart Alpha',
    subtitle: 'Aggressive Growth',
    description: 'Concentrates 70% in the highest-rated fund. Best for aggressive growth seekers.',
    detail: 'Allocates 70% to the top-rated replacement, 20% to the second, and 10% to the third. Maximises potential upside but concentrates risk in fewer funds.',
    color: '#dc2626',
    icon: '🎯',
  },
  {
    model: 'Balanced Beta',
    subtitle: 'Risk Balanced',
    description: 'Splits equally across all suggested replacements. Ideal for balanced risk-takers.',
    detail: 'Divides your switch amount equally among all replacement funds. Reduces concentration risk while still moving to better-rated alternatives.',
    color: '#ea580c',
    icon: '⚖️',
  },
  {
    model: 'Research Driven',
    subtitle: 'Data Backed',
    description: 'Weights funds by 3-year CAGR performance. Suited for data-driven investors.',
    detail: "Allocates proportionally based on each fund's 3-year CAGR. Funds with stronger track records receive a larger share of the switch amount.",
    color: '#1d4ed8',
    icon: '📊',
  },
];

export function FundRatingInsights() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { tab?: RatingTier } | null;

  const [activeTab, setActiveTab] = useState<RatingTier>(locationState?.tab ?? 'Highly Rated');
  const [showModelModal, setShowModelModal] = useState(false);
  const [expandedModelInfo, setExpandedModelInfo] = useState<RebalancingModel | null>(null);
  const { selectedModel, setSelectedModel, setBreResults } = useRebalancerStore();

  const needAttentionFunds = userHoldings.filter(f => getRatingTier(f) === 'Need Attention');

  useEffect(() => {
    if (activeTab === 'Need Attention' && !selectedModel) {
      setShowModelModal(true);
    }
  }, [activeTab, selectedModel]);

  const tierGroups = TIERS.map(tier => ({
    tier,
    funds: userHoldings.filter(f => getRatingTier(f) === tier),
  })).filter(g => g.funds.length > 0);

  const handleSelectModel = (model: RebalancingModel) => {
    setSelectedModel(model);
    setShowModelModal(false);
    setExpandedModelInfo(null);
    const results = needAttentionFunds.map(f => ({
      sourceFundId: f.id,
      replacements: getReplacements(f, fundUniverse, userHoldings),
    }));
    setBreResults(results);
  };

  const handleSwitchFund = (fund: Fund) => {
    const results = [{
      sourceFundId: fund.id,
      replacements: getReplacements(fund, fundUniverse, userHoldings),
    }];
    setBreResults(results);
    navigate('/switch-options', { state: { sourceFundId: fund.id } });
  };

  const handleRebalanceAll = () => {
    const results = needAttentionFunds.map(f => ({
      sourceFundId: f.id,
      replacements: getReplacements(f, fundUniverse, userHoldings),
    }));
    setBreResults(results);
    navigate('/rebalance-consent');
  };

  const activeFunds = tierGroups.find(g => g.tier === activeTab)?.funds ?? [];
  const totalHolding = userHoldings.reduce((s, f) => s + f.holdingValue, 0);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 pt-10 pb-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Fund Rating Insights</h1>
            <p className="text-xs text-gray-500">{userHoldings.length} funds in portfolio</p>
          </div>
          <button className="ml-auto p-1">
            <Info size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-3 gap-2">
          {tierGroups.map(({ tier, funds }) => {
            const isActive = activeTab === tier;
            const color = getTierColor(tier);
            return (
              <button
                key={tier}
                onClick={() => setActiveTab(tier)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
                  isActive
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                )}
                style={isActive ? { backgroundColor: color, borderColor: color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? 'white' : color }} />
                {tier}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  {funds.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Need Attention model bar */}
      {activeTab === 'Need Attention' && selectedModel && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <Zap size={14} className="text-red-600 flex-shrink-0" />
          <span className="text-xs text-red-700 flex-1">
            Model: <span className="font-bold">{selectedModel}</span>
          </span>
          <button onClick={() => setShowModelModal(true)} className="text-xs text-red-600 font-semibold underline">
            Change
          </button>
        </div>
      )}

      {/* Summary stats */}
      {activeFunds.length > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-gray-400">Funds</p>
              <p className="text-sm font-bold text-gray-800">{activeFunds.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Market Value</p>
              <p className="text-sm font-bold text-gray-800">
                {formatINR(activeFunds.reduce((s, f) => s + f.holdingValue, 0))}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">% of Portfolio</p>
              <p className="text-sm font-bold" style={{ color: getTierColor(activeTab) }}>
                {Math.round((activeFunds.reduce((s, f) => s + f.holdingValue, 0) / totalHolding) * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fund cards */}
      <div className="flex-1 px-4 mt-3 space-y-3">
        {activeFunds.map(fund => (
          <FundCard
            key={fund.id}
            fund={fund}
            tier={activeTab}
            showSwitchButton={activeTab === 'Need Attention'}
            onSwitch={handleSwitchFund}
          />
        ))}
        {activeFunds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No funds in this category</p>
          </div>
        )}
      </div>

      {/* Rebalance All CTA */}
      {activeTab === 'Need Attention' && needAttentionFunds.length > 0 && (
        <div className="sticky bottom-20 px-4 pb-3 pt-2 bg-gradient-to-t from-gray-100 via-gray-100/90 to-transparent">
          <button
            onClick={handleRebalanceAll}
            className="w-full flex items-center justify-center gap-2 bg-brand-red text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            <Zap size={16} />
            Rebalance All {needAttentionFunds.length} Funds
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Model Selection Modal — CENTER overlay */}
      {showModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => selectedModel && setShowModelModal(false)}
          />
          <div className="relative w-full max-w-[400px] bg-white rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900">Choose Rebalancing Model</h2>
              {selectedModel && (
                <button
                  onClick={() => setShowModelModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Applies to all funds. Tap <Info size={11} className="inline" /> for details on each model.
            </p>

            <div className="space-y-2.5">
              {MODEL_INFO.map(({ model, subtitle, description, detail, color, icon }) => {
                const isSelected = selectedModel === model;
                const isExpanded = expandedModelInfo === model;
                return (
                  <div
                    key={model}
                    className={cn(
                      'rounded-2xl border-2 transition-all overflow-hidden',
                      isSelected ? 'shadow-sm' : 'border-gray-100'
                    )}
                    style={isSelected ? { borderColor: color, backgroundColor: color + '08' } : {}}
                  >
                    {/* Main row */}
                    <div className="flex items-start gap-3 p-3 cursor-pointer" onClick={() => handleSelectModel(model)}>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: color + '18' }}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">{model}</p>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {subtitle}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
                      </div>
                      {/* Info icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedModelInfo(isExpanded ? null : model);
                        }}
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors',
                          isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        )}
                      >
                        <Info size={12} />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-3 pb-2 -mt-1">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                          <p className="text-xs text-blue-800 leading-relaxed">{detail}</p>
                        </div>
                      </div>
                    )}

                    {/* Select button */}
                    <div className="px-3 pb-3">
                      <button
                        onClick={() => handleSelectModel(model)}
                        className={cn(
                          'w-full py-2 rounded-xl text-xs font-bold transition-all',
                          isSelected ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                        style={isSelected ? { backgroundColor: color } : {}}
                      >
                        {isSelected ? '✓ Selected' : 'Select this model'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userHoldings, fundUniverse } from '../data/mockData';
import { getRatingTier, getTierColor, formatINR } from '../utils/formatters';
import { FundCard } from '../components/FundCard';
import type { Fund, RatingTier, RebalancingModel } from '../types/rebalancer';
import { getReplacements } from '../utils/breEngine';
import { useRebalancerStore } from '../store/rebalancerStore';
import { ArrowLeft, Info, ChevronRight, Zap, X } from 'lucide-react';
import { cn } from '../utils/cn';

const TIERS: RatingTier[] = ['Highly Rated', 'Moderately Rated', 'Need Attention', 'Not Rated'];

const MODEL_INFO: { model: RebalancingModel; subtitle: string; description: string; color: string }[] = [
  {
    model: 'Smart Alpha',
    subtitle: 'Aggressive Growth',
    description: 'Concentrates 70% in the highest-rated fund. Best for aggressive growth seekers.',
    color: '#dc2626',
  },
  {
    model: 'Balanced Beta',
    subtitle: 'Risk Balanced',
    description: 'Splits equally across all suggested replacements. Ideal for balanced risk-takers.',
    color: '#ea580c',
  },
  {
    model: 'Research Driven',
    subtitle: 'Data Backed',
    description: 'Weights funds by 3-year CAGR performance. Suited for data-driven investors.',
    color: '#1d4ed8',
  },
];

export function FundRatingInsights() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RatingTier>('Highly Rated');
  const [showModelModal, setShowModelModal] = useState(false);
  const { selectedModel, setSelectedModel, setBreResults } = useRebalancerStore();

  const needAttentionFunds = userHoldings.filter(f => getRatingTier(f) === 'Need Attention');

  // When user first visits Need Attention tab, show model modal if no model selected
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

    // Compute BRE results for Need Attention funds
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
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isActive ? 'white' : color }}
                />
                {tier}
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
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
          <button
            onClick={() => setShowModelModal(true)}
            className="text-xs text-red-600 font-semibold underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Summary stats for active tier */}
      {activeFunds.length > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-gray-400">Funds</p>
              <p className="text-sm font-bold text-gray-800">{activeFunds.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Invested</p>
              <p className="text-sm font-bold text-gray-800">
                {formatINR(activeFunds.reduce((s, f) => s + f.holdingValue, 0))}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">% of Portfolio</p>
              <p className="text-sm font-bold" style={{ color: getTierColor(activeTab) }}>
                {((activeFunds.reduce((s, f) => s + f.holdingValue, 0) / totalHolding) * 100).toFixed(1)}%
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

      {/* Rebalance All button for Need Attention */}
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

      {/* Model Selection Modal */}
      {showModelModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => selectedModel && setShowModelModal(false)} />
          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">Choose Rebalancing Model</h2>
              {selectedModel && (
                <button onClick={() => setShowModelModal(false)} className="p-1">
                  <X size={18} className="text-gray-500" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Select how you'd like units to be distributed across replacement funds.
            </p>

            <div className="space-y-3">
              {MODEL_INFO.map(({ model, subtitle, description, color }) => (
                <button
                  key={model}
                  onClick={() => handleSelectModel(model)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border-2 transition-all',
                    selectedModel === model ? 'border-opacity-100 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                  )}
                  style={selectedModel === model ? { borderColor: color, backgroundColor: color + '08' } : {}}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {model.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{model}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: color }}>
                          {subtitle}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

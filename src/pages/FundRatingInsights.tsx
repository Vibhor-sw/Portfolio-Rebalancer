import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userHoldings, fundUniverse } from '../data/mockData';
import { getRatingTier, getTierColor, formatINR } from '../utils/formatters';
import type { Fund, RatingTier, RebalancingModel, GroupBreResult } from '../types/rebalancer';
import { getGroupReplacements, MODEL_METRICS } from '../utils/breEngine';
import { useRebalancerStore } from '../store/rebalancerStore';
import { ArrowLeft, Info, ChevronRight, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';
import { StarRating } from '../components/ui/StarRating';

const TIERS: RatingTier[] = ['Highly Rated', 'Moderately Rated', 'Need Attention', 'Not Rated'];

export function FundRatingInsights() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { tab?: RatingTier } | null;

  const [activeTab, setActiveTab] = useState<RatingTier>(locationState?.tab ?? 'Highly Rated');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { selectedModel, setSelectedModel, setGroupBreResults } = useRebalancerStore();

  const needAttentionFunds = userHoldings.filter(f => getRatingTier(f) === 'Need Attention');

  const tierGroups = TIERS.map(tier => ({
    tier,
    funds: userHoldings.filter(f => getRatingTier(f) === tier),
  })).filter(g => g.funds.length > 0);

  const needAttentionSubGroups = useMemo(() => {
    const map = new Map<string, Fund[]>();
    needAttentionFunds.forEach(f => {
      const existing = map.get(f.subCategory) ?? [];
      map.set(f.subCategory, [...existing, f]);
    });
    return Array.from(map.entries()).map(([subCategory, funds]) => {
      const replacements = getGroupReplacements(funds, fundUniverse, userHoldings);
      return { subCategory, funds, replacements };
    });
  }, []);

  const activeFunds = tierGroups.find(g => g.tier === activeTab)?.funds ?? [];

  const activeSubGroups = useMemo(() => {
    const map = new Map<string, Fund[]>();
    activeFunds.forEach(f => {
      const existing = map.get(f.subCategory) ?? [];
      map.set(f.subCategory, [...existing, f]);
    });
    return Array.from(map.entries()).map(([subCategory, funds]) => ({ subCategory, funds }));
  }, [activeFunds]);

  const totalHolding = userHoldings.reduce((s, f) => s + f.holdingValue, 0);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSelectModel = (model: RebalancingModel) => {
    setSelectedModel(model);
    const results: GroupBreResult[] = needAttentionSubGroups.map(({ subCategory, funds, replacements }) => ({
      subCategory,
      sourceFundIds: funds.map(f => f.id),
      replacements,
    }));
    setGroupBreResults(results);
  };

  const handleRebalanceAll = () => {
    navigate('/rebalance-confirm', { state: { groupMode: true } });
  };

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

      {/* Inline model selector — Need Attention only */}
      {activeTab === 'Need Attention' && (
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-700 mb-3">Pick the model best suited for you</p>
          <div className="flex gap-2">
            {(['Smart Alpha', 'Balanced Beta', 'Research Driven'] as RebalancingModel[]).map(model => (
              <button
                key={model}
                onClick={() => handleSelectModel(model)}
                className={cn(
                  'flex-1 py-2 px-2 rounded-xl text-[11px] font-semibold transition-all border',
                  selectedModel === model
                    ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                )}
              >
                {model}
              </button>
            ))}
          </div>
          {selectedModel && (
            <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              {[
                { label: 'Expected Returns', value: `${MODEL_METRICS[selectedModel].returns}%` },
                { label: 'Volatility Rate', value: `${MODEL_METRICS[selectedModel].volatility}%` },
                { label: 'Sharpe Ratio', value: `${MODEL_METRICS[selectedModel].sharpe}` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-[9px] text-gray-400 leading-tight">{label}</p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-category accordion groups */}
      <div className="flex-1 px-4 mt-3 space-y-2">
        {activeTab === 'Need Attention'
          ? needAttentionSubGroups.map(({ subCategory, funds, replacements }) => {
              const key = `na-${subCategory}`;
              const isOpen = expandedGroups.has(key);
              const totalVal = funds.reduce((s, f) => s + f.holdingValue, 0);
              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Collapsed header */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    onClick={() => toggleGroup(key)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{subCategory}</p>
                        {replacements.length > 0 && (
                          <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full border border-green-100">
                            {replacements.length} alternatives
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {funds.length} fund{funds.length > 1 ? 's' : ''} · {formatINR(totalVal)}
                      </p>
                    </div>
                    {isOpen
                      ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                    }
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-gray-50 px-4 pt-3 pb-4 space-y-3 bg-gray-50/40">
                      {/* Going out */}
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Going Out</p>
                      <div className="space-y-2">
                        {funds.map(f => (
                          <div key={f.id} className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={{ backgroundColor: f.amcColor }}
                            >
                              {f.amcInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">{f.fundName}</p>
                              <StarRating rating={f.geojitRating} size={9} />
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-bold text-brand-red">{formatINR(f.holdingValue)}</p>
                              <p className="text-[9px] text-gray-400">{parseFloat((f.holdingValue / (f.nav ?? 100)).toFixed(3))} units</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Coming in */}
                      {replacements.length > 0 && (
                        <>
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider pt-1">Coming In</p>
                          <div className="space-y-2">
                            {replacements.map(rep => (
                              <div key={rep.id} className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                  style={{ backgroundColor: rep.amcColor }}
                                >
                                  {rep.amcInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">{rep.fundName}</p>
                                  <StarRating rating={rep.geojitRating} size={9} />
                                </div>
                                {rep.badge && (
                                  <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0',
                                    rep.badge === 'Gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                                  )}>{rep.badge}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          : activeSubGroups.map(({ subCategory, funds }) => {
              const key = `${activeTab}-${subCategory}`;
              const isOpen = expandedGroups.has(key);
              const totalVal = funds.reduce((s, f) => s + f.holdingValue, 0);
              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    onClick={() => toggleGroup(key)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{subCategory}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {funds.length} fund{funds.length > 1 ? 's' : ''} · {formatINR(totalVal)}
                      </p>
                    </div>
                    {isOpen
                      ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                    }
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-50 px-4 pt-3 pb-4 space-y-2 bg-gray-50/40">
                      {funds.map(f => {
                        const pnl = f.holdingValue - f.investedValue;
                        const pnlPct = f.investedValue > 0 ? ((pnl / f.investedValue) * 100).toFixed(1) : '0.0';
                        return (
                          <div key={f.id} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={{ backgroundColor: f.amcColor }}
                            >
                              {f.amcInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">{f.fundName}</p>
                              <StarRating rating={f.geojitRating} size={9} />
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-bold text-gray-800">{formatINR(f.holdingValue)}</p>
                              <p className={cn('text-[9px] font-medium', pnl >= 0 ? 'text-green-600' : 'text-red-500')}>
                                {pnl >= 0 ? '+' : ''}{pnlPct}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
        }
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
            onClick={selectedModel ? handleRebalanceAll : undefined}
            disabled={!selectedModel}
            className={cn(
              'w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl shadow-lg transition-all',
              selectedModel
                ? 'bg-brand-red text-white hover:bg-red-700 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {selectedModel ? (
              <>
                <Zap size={16} />
                Rebalance All {needAttentionFunds.length} Funds
                <ChevronRight size={16} />
              </>
            ) : (
              <>Select a Model First</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

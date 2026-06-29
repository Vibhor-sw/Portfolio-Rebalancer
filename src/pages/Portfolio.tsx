import { useNavigate } from 'react-router-dom';
import { userHoldings } from '../data/mockData';
import { formatINR, formatPnL, getRatingTier, getTierColor } from '../utils/formatters';
import { TrendingUp, TrendingDown, ChevronRight, Zap, Bell } from 'lucide-react';
import type { RatingTier } from '../types/rebalancer';

const TIER_ORDER: RatingTier[] = ['Highly Rated', 'Moderately Rated', 'Need Attention', 'Not Rated'];

export function Portfolio() {
  const navigate = useNavigate();

  const totalHolding = userHoldings.reduce((s, f) => s + f.holdingValue, 0);
  const totalInvested = userHoldings.reduce((s, f) => s + f.investedValue, 0);
  const totalPnL = totalHolding - totalInvested;
  const pnlData = formatPnL(totalPnL);

  // Group by tier
  const tierGroups = TIER_ORDER.map(tier => {
    const funds = userHoldings.filter(f => getRatingTier(f) === tier);
    const holding = funds.reduce((s, f) => s + f.holdingValue, 0);
    return { tier, funds, holding, percent: (holding / totalHolding) * 100 };
  }).filter(g => g.funds.length > 0);

  const needAttentionCount = userHoldings.filter(f => getRatingTier(f) === 'Need Attention').length;

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-green-900 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-green-200 text-xs font-medium uppercase tracking-wider">FundsGenie</p>
            <h1 className="text-white text-xl font-bold mt-0.5">My Portfolio</h1>
          </div>
          <button className="relative p-2">
            <Bell size={20} className="text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
          </button>
        </div>

        <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4">
          <p className="text-green-200 text-xs mb-1">Total Portfolio Value</p>
          <p className="text-white text-3xl font-bold tracking-tight">{formatINR(totalHolding)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-200 text-xs">Invested: {formatINR(totalInvested)}</span>
            <span className="text-green-300 text-xs">•</span>
            <div className="flex items-center gap-1">
              {pnlData.positive ? (
                <TrendingUp size={12} className="text-green-300" />
              ) : (
                <TrendingDown size={12} className="text-red-300" />
              )}
              <span className={`text-xs font-semibold ${pnlData.positive ? 'text-green-300' : 'text-red-300'}`}>
                {pnlData.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Rebalance Alert Widget */}
        {needAttentionCount > 0 && (
          <div
            className="bg-red-50 border border-red-200 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate('/fund-rating-insights')}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">Portfolio Needs Attention</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {needAttentionCount} fund{needAttentionCount > 1 ? 's' : ''} rated low — consider rebalancing
                </p>
                <button className="mt-2 text-xs font-semibold text-red-700 flex items-center gap-1">
                  View Insights <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Rating Distribution</h2>
            <button
              onClick={() => navigate('/fund-rating-insights')}
              className="text-xs text-brand-green font-semibold flex items-center gap-0.5"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex rounded-full overflow-hidden h-3 mb-4">
            {tierGroups.map(g => (
              <div
                key={g.tier}
                style={{ width: `${g.percent}%`, backgroundColor: getTierColor(g.tier) }}
                className="transition-all"
              />
            ))}
          </div>

          <div className="space-y-2">
            {tierGroups.map(g => (
              <div key={g.tier} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getTierColor(g.tier) }}
                />
                <span className="text-xs text-gray-600 flex-1">{g.tier}</span>
                <span className="text-xs text-gray-500">{g.funds.length} funds</span>
                <span className="text-xs font-semibold text-gray-800 w-16 text-right">{formatINR(g.holding)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900">All Holdings ({userHoldings.length})</h2>
          </div>
          {userHoldings.map((fund, i) => {
            const tier = getRatingTier(fund);
            const pnl = fund.holdingValue - fund.investedValue;
            const pnlF = formatPnL(pnl);
            return (
              <div
                key={fund.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 ${
                  i < userHoldings.length - 1 ? 'border-b border-gray-50' : ''
                }`}
                onClick={() => navigate('/fund-rating-insights')}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: fund.amcColor }}
                >
                  {fund.amcInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{fund.fundName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getTierColor(tier) }}
                    />
                    <span className="text-[10px] text-gray-400">{tier}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">{formatINR(fund.holdingValue)}</p>
                  <p className={`text-[10px] font-medium ${pnlF.positive ? 'text-brand-green' : 'text-brand-red'}`}>
                    {pnlF.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

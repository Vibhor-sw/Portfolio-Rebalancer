import { useLocation, useNavigate } from 'react-router-dom';
import { userHoldings } from '../data/mockData';
import { useRebalancerStore } from '../store/rebalancerStore';
import { getRatingTier, getTierColor, formatINR } from '../utils/formatters';
import { StarRating } from '../components/ui/StarRating';
import { ReplacementCard } from '../components/FundCard';
import { getModelAllocations } from '../utils/breEngine';
import { ArrowLeft, ArrowRight, Info, TrendingDown } from 'lucide-react';
import type { Fund } from '../types/rebalancer';
import { cn } from '../utils/cn';

export function SwitchOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { breResults, selectedModel, modelUnits, setModelUnits } = useRebalancerStore();

  const sourceFundId = (location.state as { sourceFundId?: string } | null)?.sourceFundId
    ?? breResults[0]?.sourceFundId;

  const breResult = breResults.find(r => r.sourceFundId === sourceFundId);
  const sourceFund = userHoldings.find(f => f.id === sourceFundId);

  if (!sourceFund || !breResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-gray-500 text-sm">No switch data found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-brand-green text-sm font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const tier = getRatingTier(sourceFund);
  const pnl = sourceFund.holdingValue - sourceFund.investedValue;
  const totalUnits = Math.round(sourceFund.holdingValue / 10);

  // Get model allocations if model selected, else equal split
  const modelToUse = selectedModel ?? 'Balanced Beta';
  const defaultAllocations = getModelAllocations(breResult.replacements, modelToUse, totalUnits);

  const getUnits = (fund: Fund) => {
    return modelUnits[sourceFundId]?.[fund.id] ?? defaultAllocations[fund.id] ?? 0;
  };

  const handleUnitsChange = (replacementId: string, units: number) => {
    setModelUnits(sourceFundId, replacementId, units);
  };

  const totalAllocated = breResult.replacements.reduce((s, f) => s + getUnits(f), 0);
  const isBalanced = totalAllocated === totalUnits;

  const handleProceed = () => {
    navigate('/rebalance-consent', { state: { sourceFundId } });
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 pt-10 pb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Switch Options</h1>
            {selectedModel && (
              <p className="text-xs text-gray-500">Model: {selectedModel}</p>
            )}
          </div>
          <button className="ml-auto p-1">
            <Info size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Source fund */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Switch From</p>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: sourceFund.amcColor }}
              >
                {sourceFund.amcInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">{sourceFund.fundName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getTierColor(tier) }}
                  />
                  <span className="text-xs text-gray-500">{tier}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{sourceFund.subCategory}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">GJ</span>
                <StarRating rating={sourceFund.geojitRating} size={11} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">MS</span>
                <StarRating rating={sourceFund.morningstarRating} size={11} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-gray-400">Holding Value</p>
                <p className="text-sm font-bold text-gray-900">{formatINR(sourceFund.holdingValue)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">P&amp;L</p>
                <p className={cn('text-sm font-semibold', pnl >= 0 ? 'text-brand-green' : 'text-brand-red')}>
                  {pnl >= 0 ? '+' : '−'}{formatINR(Math.abs(pnl))}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">XIRR</p>
                <div className="flex items-center gap-0.5">
                  <TrendingDown size={12} className="text-brand-red" />
                  <p className="text-sm font-semibold text-brand-red">{Math.abs(sourceFund.xirr).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="mt-2 bg-red-100 rounded-lg px-3 py-1.5">
              <p className="text-[10px] text-red-700 font-medium">
                Simulated total units: <span className="font-bold">{totalUnits}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-px w-12 bg-gray-300" />
            <ArrowRight size={18} className="text-brand-green" />
            <div className="h-px w-12 bg-gray-300" />
          </div>
        </div>

        {/* Replacement funds */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Switch To</p>
            <div className={cn(
              'text-[10px] px-2 py-1 rounded-full font-semibold',
              isBalanced ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            )}>
              {totalAllocated}/{totalUnits} units allocated
            </div>
          </div>

          {breResult.replacements.length > 0 ? (
            <div className="space-y-3">
              {breResult.replacements.map(fund => (
                <ReplacementCard
                  key={fund.id}
                  fund={fund}
                  units={getUnits(fund)}
                  onUnitsChange={(units) => handleUnitsChange(fund.id, units)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <p className="text-gray-500 text-sm">No suitable replacement funds found for this category.</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <p className="text-[10px] text-amber-700">
            <span className="font-bold">Disclaimer:</span> Units shown are simulated. Actual redemption and purchase will be processed at applicable NAV. Switch may take 3-5 business days.
          </p>
        </div>
      </div>

      {/* Proceed button */}
      {breResult.replacements.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 bg-gradient-to-t from-gray-100 to-transparent">
          <button
            onClick={handleProceed}
            className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all"
          >
            Proceed to Rebalance
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

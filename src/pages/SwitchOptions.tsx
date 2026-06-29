import { useLocation, useNavigate } from 'react-router-dom';
import { userHoldings } from '../data/mockData';
import { useRebalancerStore } from '../store/rebalancerStore';
import { getRatingTier, getTierColor, formatINR } from '../utils/formatters';
import { StarRating } from '../components/ui/StarRating';
import { getModelAllocations } from '../utils/breEngine';
import { ArrowDown, ArrowLeft, Info, TrendingDown, TrendingUp, ExternalLink } from 'lucide-react';
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
        <button onClick={() => navigate(-1)} className="mt-4 text-brand-green text-sm font-semibold">Go Back</button>
      </div>
    );
  }

  const tier = getRatingTier(sourceFund);
  const pnl = sourceFund.holdingValue - sourceFund.investedValue;
  const sourceNav = sourceFund.nav ?? 100;
  const totalUnits = parseFloat((sourceFund.holdingValue / sourceNav).toFixed(3));
  const modelToUse = selectedModel ?? 'Balanced Beta';
  const defaultAllocations = getModelAllocations(breResult.replacements, modelToUse, Math.round(totalUnits * 1000));

  const getUnits = (fund: Fund) => {
    const stored = modelUnits[sourceFundId]?.[fund.id];
    if (stored !== undefined) return stored;
    const raw = (defaultAllocations[fund.id] ?? 0) / 1000;
    return parseFloat(raw.toFixed(3));
  };

  const handleUnitsChange = (replacementId: string, units: number) => {
    setModelUnits(sourceFundId, replacementId, parseFloat(units.toFixed(3)));
  };

  const handleProceed = () => {
    navigate('/rebalance-consent', { state: { sourceFundId } });
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 pt-10 pb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Switch Options</h1>
            {selectedModel && <p className="text-xs text-gray-500">Model: {selectedModel}</p>}
          </div>
          <button className="ml-auto p-1"><Info size={18} className="text-gray-400" /></button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* ── SOURCE FUND ─────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Switch From</p>
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
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTierColor(tier) }} />
                  <span className="text-xs text-gray-500">{tier}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{sourceFund.subCategory}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-medium">GEOJIT</span>
                <StarRating rating={sourceFund.geojitRating} size={11} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-medium">MS</span>
                <StarRating rating={sourceFund.morningstarRating} size={11} />
              </div>
            </div>

            {/* Holdings row */}
            <div className="mt-3 grid grid-cols-3 gap-2 bg-red-100/50 rounded-xl px-3 py-2.5">
              <div>
                <p className="text-[9px] text-red-500 font-medium uppercase">Holding</p>
                <p className="text-sm font-bold text-gray-900">{formatINR(sourceFund.holdingValue)}</p>
              </div>
              <div>
                <p className="text-[9px] text-red-500 font-medium uppercase">Units</p>
                <p className="text-sm font-bold text-gray-900">{totalUnits.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-[9px] text-red-500 font-medium uppercase">NAV</p>
                <p className="text-sm font-bold text-gray-900">₹{sourceNav.toFixed(4)}</p>
              </div>
            </div>

            {/* P&L row */}
            <div className="mt-2 flex items-center gap-2">
              {pnl >= 0
                ? <TrendingUp size={13} className="text-brand-green" />
                : <TrendingDown size={13} className="text-brand-red" />}
              <span className={cn('text-xs font-semibold', pnl >= 0 ? 'text-brand-green' : 'text-brand-red')}>
                {pnl >= 0 ? '+' : '−'}{formatINR(Math.abs(pnl))} P&amp;L
              </span>
              <span className="text-gray-300 text-xs">•</span>
              <span className={cn('text-xs font-semibold', sourceFund.xirr >= 0 ? 'text-brand-green' : 'text-brand-red')}>
                {sourceFund.xirr.toFixed(1)}% XIRR
              </span>
            </div>
          </div>
        </div>

        {/* ── ARROW ───────────────────────────────── */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex-1 h-px bg-gray-300" />
          <div className="flex flex-col items-center gap-0.5">
            <ArrowDown size={18} className="text-brand-green" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {breResult.replacements.length} Better Rated — Same Category
            </span>
          </div>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* ── REPLACEMENT CARDS (side by side grid) ── */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Switch To</p>

          {breResult.replacements.length > 0 ? (
            <div className={cn(
              'grid gap-2',
              breResult.replacements.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
            )}>
              {breResult.replacements.map((fund, idx) => {
                const units = getUnits(fund);
                const fundNav = fund.nav ?? 100;
                const approxValue = units * fundNav;
                return (
                  <div key={fund.id} className="bg-white border-2 border-green-100 rounded-2xl overflow-hidden">
                    {/* Card header */}
                    <div className="bg-green-50 px-3 pt-3 pb-2">
                      <div className="flex items-start gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ backgroundColor: fund.amcColor }}
                        >
                          {fund.amcInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">{fund.fundName}</p>
                            <ExternalLink size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {fund.badge && (
                              <span className={cn(
                                'text-[9px] px-1 py-0.5 rounded font-bold',
                                fund.badge === 'Gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                              )}>
                                {fund.badge}
                              </span>
                            )}
                            <span className="text-[9px] text-gray-500">{fund.plan}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ratings */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-400 font-medium">GJ</span>
                          <StarRating rating={fund.geojitRating} size={10} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-400 font-medium">MS</span>
                          <StarRating rating={fund.morningstarRating} size={10} />
                        </div>
                      </div>
                    </div>

                    {/* CAGR row */}
                    <div className="flex items-center justify-around px-2 py-2 border-t border-green-50">
                      {[
                        { label: '1Y', val: fund.cagr1Y },
                        { label: '3Y', val: fund.cagr3Y },
                        { label: '5Y', val: fund.cagr5Y },
                      ].map(({ label, val }) => val != null && (
                        <div key={label} className="text-center">
                          <p className="text-[9px] text-gray-400">{label} CAGR</p>
                          <p className="text-xs font-bold text-green-700">{val.toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>

                    {/* NAV + units */}
                    <div className="px-3 pb-1 pt-1 border-t border-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-gray-400 font-medium uppercase">NAV</p>
                          <p className="text-xs font-bold text-gray-800">₹{fundNav.toFixed(4)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-400 font-medium uppercase">Est. Value</p>
                          <p className="text-xs font-semibold text-gray-700">{formatINR(approxValue)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Units allocation — editable */}
                    <div className="bg-green-50 px-3 py-2.5 border-t border-green-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-green-800 uppercase tracking-wide">Units to Buy</span>
                        <span className="text-[9px] text-green-600 font-medium">Option {idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUnitsChange(fund.id, Math.max(0, parseFloat((units - 0.001).toFixed(3))))}
                          className="w-7 h-7 rounded-full bg-white border border-green-200 flex items-center justify-center text-green-700 font-bold text-sm hover:bg-green-100 active:scale-95"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={units}
                          step={0.001}
                          min={0}
                          onChange={(e) => handleUnitsChange(fund.id, Math.max(0, parseFloat(parseFloat(e.target.value).toFixed(3)) || 0))}
                          className="flex-1 text-center text-sm font-bold text-gray-900 bg-white border border-green-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-brand-green"
                        />
                        <button
                          onClick={() => handleUnitsChange(fund.id, parseFloat((units + 0.001).toFixed(3)))}
                          className="w-7 h-7 rounded-full bg-white border border-green-200 flex items-center justify-center text-green-700 font-bold text-sm hover:bg-green-100 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <p className="text-gray-500 text-sm">No suitable replacement funds found for this category.</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-amber-700 leading-relaxed">
            <span className="font-bold">Disclaimer:</span> Units shown are calculated at current NAV and are indicative. Actual units will be allotted at NAV on order processing date. Switch may take 3–5 business days. Past performance is not indicative of future results.
          </p>
        </div>
      </div>

      {/* Proceed CTA */}
      {breResult.replacements.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 bg-gradient-to-t from-gray-100 to-transparent">
          <button
            onClick={handleProceed}
            className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all"
          >
            Proceed to Review
            <ArrowDown size={16} className="rotate-[-90deg]" />
          </button>
        </div>
      )}
    </div>
  );
}

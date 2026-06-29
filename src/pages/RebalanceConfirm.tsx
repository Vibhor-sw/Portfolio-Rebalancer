import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRebalancerStore } from '../store/rebalancerStore';
import { userHoldings, fundUniverse } from '../data/mockData';
import { formatINR } from '../utils/formatters';
import { StarRating } from '../components/ui/StarRating';
import { getModelAllocations } from '../utils/breEngine';
import { ArrowLeft, CheckCircle2, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Fund } from '../types/rebalancer';

export function RebalanceConfirm() {
  const navigate = useNavigate();
  const { breResults, selectedFundsForSwitch, selectedModel, modelUnits, reset } = useRebalancerStore();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedResults = breResults.filter(r => selectedFundsForSwitch.includes(r.sourceFundId));

  const getReplacementFund = (id: string): Fund | undefined =>
    fundUniverse.find(f => f.id === id);

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setSubmitting(false);
    setSuccess(true);
  };

  const handleDone = () => {
    reset();
    navigate('/portfolio');
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <PartyPopper size={36} className="text-brand-green" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rebalancing Initiated!</h2>
        <p className="text-sm text-gray-500 mb-2">
          Your switch request has been successfully placed.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Processing may take 3-5 business days. You'll receive a notification once complete.
        </p>

        {/* Summary */}
        <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs font-bold text-green-800 mb-2">Switch Summary</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-green-700">Funds switched</span>
              <span className="text-xs font-bold text-green-900">{selectedResults.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-green-700">Model used</span>
              <span className="text-xs font-bold text-green-900">{selectedModel ?? 'Balanced Beta'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-green-700">Total value</span>
              <span className="text-xs font-bold text-green-900">
                {formatINR(
                  selectedResults.reduce((s, r) => {
                    const f = userHoldings.find(h => h.id === r.sourceFundId);
                    return s + (f?.holdingValue ?? 0);
                  }, 0)
                )}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDone}
          className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all"
        >
          Go to Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 pt-10 pb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Confirm Rebalance</h1>
            <p className="text-xs text-gray-500">Final review before submission</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {['Select Funds', 'Consent', 'Confirm'].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                i <= 1 ? 'bg-brand-green text-white' : 'bg-brand-green text-white'
              )}>
                {i < 2 ? <CheckCircle2 size={14} /> : '3'}
              </div>
              <span className={cn('text-xs', i === 2 ? 'font-semibold text-gray-900' : 'text-gray-400')}>{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-brand-green" />}
            </div>
          ))}
        </div>

        {/* Switch pairs */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Switch Orders</p>
          <div className="space-y-3">
            {selectedResults.map(result => {
              const sourceFund = userHoldings.find(f => f.id === result.sourceFundId);
              if (!sourceFund) return null;
              const totalUnits = Math.round(sourceFund.holdingValue / 10);
              const modelToUse = selectedModel ?? 'Balanced Beta';
              const defaultAlloc = getModelAllocations(result.replacements, modelToUse, totalUnits);

              return (
                <div key={result.sourceFundId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Source */}
                  <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded-full">Redeem</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: sourceFund.amcColor }}
                      >
                        {sourceFund.amcInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{sourceFund.fundName}</p>
                        <p className="text-[10px] text-gray-500">{sourceFund.subCategory} • {totalUnits} units</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatINR(sourceFund.holdingValue)}</p>
                    </div>
                  </div>

                  {/* Replacements */}
                  <div className="px-4 py-3 space-y-2.5">
                    <span className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-full">Purchase</span>
                    {result.replacements.map(rep => {
                      const fund = getReplacementFund(rep.id);
                      if (!fund) return null;
                      const units = modelUnits[sourceFund.id]?.[fund.id] ?? defaultAlloc[fund.id] ?? 0;
                      return (
                        <div key={fund.id} className="flex items-center gap-3 mt-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: fund.amcColor }}
                          >
                            {fund.amcInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{fund.fundName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <StarRating rating={fund.geojitRating} size={10} />
                              {fund.badge && (
                                <span className={cn(
                                  'text-[9px] px-1 py-0.5 rounded font-bold',
                                  fund.badge === 'Gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                                )}>
                                  {fund.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-brand-green">{units} units</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final summary */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <p className="text-xs font-bold text-gray-700 mb-3">Order Summary</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total switch orders</span>
              <span className="text-xs font-semibold text-gray-800">{selectedResults.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Rebalancing model</span>
              <span className="text-xs font-semibold text-gray-800">{selectedModel ?? 'Balanced Beta'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total redemption value</span>
              <span className="text-xs font-bold text-brand-red">
                {formatINR(selectedResults.reduce((s, r) => {
                  const f = userHoldings.find(h => h.id === r.sourceFundId);
                  return s + (f?.holdingValue ?? 0);
                }, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 bg-gradient-to-t from-gray-100 to-transparent">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Place Switch Order
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

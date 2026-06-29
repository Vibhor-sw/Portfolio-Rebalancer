import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRebalancerStore } from '../store/rebalancerStore';
import { userHoldings } from '../data/mockData';
import { getRatingTier, getTierColor, formatINR } from '../utils/formatters';
import { StarRating } from '../components/ui/StarRating';
import { ArrowLeft, Shield, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export function RebalanceConsent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { breResults, selectedModel, setSelectedFunds, setConsentGiven } = useRebalancerStore();

  const sourceFundId = (location.state as { sourceFundId?: string } | null)?.sourceFundId;

  // Determine which funds to show
  const relevantResults = sourceFundId
    ? breResults.filter(r => r.sourceFundId === sourceFundId)
    : breResults;

  const sourceFunds = relevantResults
    .map(r => userHoldings.find(f => f.id === r.sourceFundId))
    .filter((f): f is NonNullable<typeof f> => f !== undefined);

  const [agreedRisk, setAgreedRisk] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [checkedFunds, setCheckedFunds] = useState<Set<string>>(
    new Set(sourceFunds.map(f => f.id))
  );

  const toggleFund = (id: string) => {
    setCheckedFunds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canProceed = agreedRisk && agreedTerms && checkedFunds.size > 0;

  const handleProceed = () => {
    setConsentGiven(true);
    setSelectedFunds([...checkedFunds]);
    navigate('/rebalance-confirm');
  };

  const totalSwitchValue = sourceFunds
    .filter(f => checkedFunds.has(f.id))
    .reduce((s, f) => s + f.holdingValue, 0);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 pt-10 pb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Rebalance Consent</h1>
            <p className="text-xs text-gray-500">Review before proceeding</p>
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
                i === 1 ? 'bg-brand-green text-white' : i < 1 ? 'bg-green-100 text-brand-green' : 'bg-gray-100 text-gray-400'
              )}>
                {i < 1 ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={cn('text-xs', i === 1 ? 'font-semibold text-gray-900' : 'text-gray-400')}>{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Model info */}
        {selectedModel && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Shield size={14} className="text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-700">
              Rebalancing using <span className="font-bold">{selectedModel}</span> model
            </span>
          </div>
        )}

        {/* Fund selection */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Select Funds to Switch ({checkedFunds.size}/{sourceFunds.length})
          </p>
          <div className="space-y-2">
            {sourceFunds.map(fund => {
              const tier = getRatingTier(fund);
              const isChecked = checkedFunds.has(fund.id);
              const result = relevantResults.find(r => r.sourceFundId === fund.id);
              return (
                <div
                  key={fund.id}
                  className={cn(
                    'bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all',
                    isChecked ? 'border-brand-green' : 'border-gray-100'
                  )}
                  onClick={() => toggleFund(fund.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        isChecked ? 'border-brand-green bg-brand-green' : 'border-gray-300'
                      )}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: fund.amcColor }}
                    >
                      {fund.amcInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{fund.fundName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getTierColor(tier) }} />
                        <span className="text-[10px] text-gray-500">{tier}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">GJ</span>
                          <StarRating rating={fund.geojitRating} size={10} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">MS</span>
                          <StarRating rating={fund.morningstarRating} size={10} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{formatINR(fund.holdingValue)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {result?.replacements.length ?? 0} replacement{(result?.replacements.length ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Switch summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Switch Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Funds to be switched</span>
              <span className="text-xs font-semibold text-gray-900">{checkedFunds.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total switch value</span>
              <span className="text-xs font-semibold text-gray-900">{formatINR(totalSwitchValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Expected processing time</span>
              <span className="text-xs font-semibold text-gray-900">3-5 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Exit load may apply</span>
              <span className="text-xs font-semibold text-amber-600">As per fund terms</span>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800">Risk Disclaimer</p>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            Mutual fund investments are subject to market risks. Past performance does not guarantee future returns.
            The switch will be executed at applicable NAV on the day of processing. Capital gains tax may apply
            based on the holding period. Please consult your financial advisor before proceeding.
          </p>
        </div>

        {/* Consent checkboxes */}
        <div className="space-y-3">
          <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setAgreedRisk(!agreedRisk)}
          >
            <div
              className={cn(
                'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                agreedRisk ? 'border-brand-green bg-brand-green' : 'border-gray-300'
              )}
            >
              {agreedRisk && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              I understand the risks involved in mutual fund switching and acknowledge that the rebalancing is based on algorithmic recommendations, not personalized financial advice.
            </p>
          </div>
          <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setAgreedTerms(!agreedTerms)}
          >
            <div
              className={cn(
                'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                agreedTerms ? 'border-brand-green bg-brand-green' : 'border-gray-300'
              )}
            >
              {agreedTerms && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              I agree to the <span className="text-brand-green font-semibold">Terms &amp; Conditions</span> and <span className="text-brand-green font-semibold">Privacy Policy</span> of FundsGenie Rebalancer.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 bg-gradient-to-t from-gray-100 to-transparent">
        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={cn(
            'w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl shadow-lg transition-all',
            canProceed
              ? 'bg-brand-green text-white hover:bg-green-700 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          Confirm &amp; Proceed
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

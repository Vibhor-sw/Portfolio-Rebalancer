import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRebalancerStore } from '../store/rebalancerStore';
import { userHoldings, fundUniverse } from '../data/mockData';
import { formatINR } from '../utils/formatters';
import { StarRating } from '../components/ui/StarRating';
import { getModelAllocations, getGroupModelAllocations } from '../utils/breEngine';
import {
  ArrowLeft, CheckCircle2, ArrowRight, Loader2, PartyPopper,
  Zap, Clock, Info, ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn } from '../utils/cn';
import type { Fund, OrderMode } from '../types/rebalancer';

export function RebalanceConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGroupMode = (location.state as { groupMode?: boolean } | null)?.groupMode ?? false;

  const { breResults, selectedFundsForSwitch, selectedModel, modelUnits, groupBreResults, reset } = useRebalancerStore();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderMode, setOrderMode] = useState<OrderMode | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showModeInfo, setShowModeInfo] = useState<OrderMode | null>(null);

  const selectedResults = breResults.filter(r => selectedFundsForSwitch.includes(r.sourceFundId));

  const getReplacementFund = (id: string): Fund | undefined =>
    fundUniverse.find(f => f.id === id);

  const totalRedemptionValue = isGroupMode
    ? groupBreResults.reduce((s, gr) => s + gr.sourceFundIds.reduce((sv, id) => {
        const f = userHoldings.find(h => h.id === id);
        return sv + (f?.holdingValue ?? 0);
      }, 0), 0)
    : selectedResults.reduce((s, r) => {
        const f = userHoldings.find(h => h.id === r.sourceFundId);
        return s + (f?.holdingValue ?? 0);
      }, 0);

  const totalBuyOrders = isGroupMode
    ? groupBreResults.reduce((s, gr) => s + gr.replacements.length, 0)
    : selectedResults.reduce((s, r) => s + r.replacements.length, 0);

  const totalSellOrders = isGroupMode
    ? groupBreResults.reduce((s, gr) => s + gr.sourceFundIds.length, 0)
    : selectedResults.length;

  const handleConfirm = async () => {
    if (!orderMode) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2200));
    setSubmitting(false);
    setSuccess(true);
  };

  const handleDone = () => {
    reset();
    navigate('/portfolio');
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gray-50">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
          <PartyPopper size={36} className="text-brand-green" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders Placed!</h2>
        <p className="text-sm text-gray-500 mb-1">
          Your rebalancing orders have been successfully submitted.
        </p>
        {orderMode === 'instant_credit' ? (
          <p className="text-xs text-green-700 font-medium bg-green-50 rounded-xl px-3 py-2 mb-6">
            ⚡ Broker credit applied — buy orders active immediately.
          </p>
        ) : (
          <p className="text-xs text-amber-700 font-medium bg-amber-50 rounded-xl px-3 py-2 mb-6">
            ⏳ Sell orders placed. Buy orders will execute after settlement (T+2/T+3).
          </p>
        )}

        <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mb-6 text-left space-y-2">
          <p className="text-xs font-bold text-gray-700 mb-2">Order Summary</p>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Sell orders</span>
            <span className="text-xs font-bold text-red-600">{totalSellOrders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Buy orders</span>
            <span className="text-xs font-bold text-green-600">{totalBuyOrders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Total switch value</span>
            <span className="text-xs font-bold text-gray-800">{formatINR(totalRedemptionValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Model used</span>
            <span className="text-xs font-bold text-gray-800">{selectedModel ?? 'Balanced Beta'}</span>
          </div>
        </div>

        <div className="w-full space-y-2">
          <button onClick={handleDone} className="w-full bg-brand-green text-white font-bold py-3.5 rounded-2xl shadow hover:bg-green-700 active:scale-[0.98] transition-all">
            Go to Portfolio
          </button>
          <button onClick={() => { reset(); navigate('/'); }} className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-sm">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const modelToUse = selectedModel ?? 'Balanced Beta';

  return (
    <div className="flex flex-col min-h-screen pb-56 bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 pt-10 pb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Review & Confirm</h1>
            <p className="text-xs text-gray-500">Final review before placing orders</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {['Select', 'Model', 'Confirm'].map((step, i) => (
            <div key={step} className="flex items-center gap-1.5 flex-1">
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

        {/* Summary chips */}
        <div className="flex gap-2 flex-wrap">
          <div className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">
            🔄 Selling {totalSellOrders} fund{totalSellOrders > 1 ? 's' : ''}
          </div>
          <div className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">
            💰 {formatINR(totalRedemptionValue)}
          </div>
          <div className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">
            📋 {totalSellOrders + totalBuyOrders} orders
          </div>
        </div>

        {/* ── GROUP MODE TABLE VIEW ─────────────────── */}
        {isGroupMode && groupBreResults.length > 0 ? (
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rebalancing Summary</p>
            {groupBreResults.map(gr => {
              const sourceFunds = gr.sourceFundIds
                .map(id => userHoldings.find(f => f.id === id))
                .filter(Boolean) as Fund[];
              const allocs = getGroupModelAllocations(sourceFunds, gr.replacements, modelToUse);
              const totalVal = sourceFunds.reduce((s, f) => s + f.holdingValue, 0);

              return (
                <div key={gr.subCategory} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Sub-category header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">{gr.subCategory}</p>
                    <p className="text-xs font-semibold text-gray-500">{formatINR(totalVal)}</p>
                  </div>

                  {/* Horizontal scroll table */}
                  <div className="overflow-x-auto">
                    <table
                      className="text-xs border-collapse"
                      style={{ minWidth: `${(sourceFunds.length + gr.replacements.length + 1) * 100}px` }}
                    >
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 uppercase w-16 whitespace-nowrap"></th>
                          {sourceFunds.map(f => (
                            <th key={f.id} className="px-3 py-2 text-center min-w-[100px]">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Current</span>
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                  style={{ backgroundColor: f.amcColor }}
                                >
                                  {f.amcInitials}
                                </div>
                                <p className="text-[9px] text-gray-600 font-semibold leading-tight text-center max-w-[80px]">
                                  {f.fundName.split(' ').slice(0, 3).join(' ')}
                                </p>
                              </div>
                            </th>
                          ))}
                          {gr.replacements.map(rep => (
                            <th key={rep.id} className="px-3 py-2 text-center min-w-[100px]">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">New</span>
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                  style={{ backgroundColor: rep.amcColor }}
                                >
                                  {rep.amcInitials}
                                </div>
                                <p className="text-[9px] text-gray-600 font-semibold leading-tight text-center max-w-[80px]">
                                  {rep.fundName.split(' ').slice(0, 3).join(' ')}
                                </p>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Qty row */}
                        <tr className="border-b border-gray-50">
                          <td className="px-3 py-2.5 text-[10px] font-bold text-gray-500 whitespace-nowrap">Qty</td>
                          {sourceFunds.map(f => (
                            <td key={f.id} className="px-3 py-2.5 text-center">
                              <p className="text-xs font-bold text-red-600">
                                {parseFloat((f.holdingValue / (f.nav ?? 100)).toFixed(3))}
                              </p>
                              <p className="text-[9px] text-gray-400">units</p>
                            </td>
                          ))}
                          {gr.replacements.map(rep => (
                            <td key={rep.id} className="px-3 py-2.5 text-center">
                              <p className="text-xs font-bold text-green-700">
                                {(allocs[rep.id]?.units ?? 0).toFixed(3)}
                              </p>
                              <p className="text-[9px] text-gray-400">units</p>
                            </td>
                          ))}
                        </tr>
                        {/* Value row */}
                        <tr>
                          <td className="px-3 py-2.5 text-[10px] font-bold text-gray-500 whitespace-nowrap">Value</td>
                          {sourceFunds.map(f => (
                            <td key={f.id} className="px-3 py-2.5 text-center">
                              <p className="text-xs font-bold text-red-600">{formatINR(f.holdingValue)}</p>
                            </td>
                          ))}
                          {gr.replacements.map(rep => (
                            <td key={rep.id} className="px-3 py-2.5 text-center">
                              <p className="text-xs font-bold text-green-700">{formatINR(allocs[rep.id]?.value ?? 0)}</p>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Star ratings row */}
                  <div className="px-4 py-2 border-t border-gray-50 flex gap-3">
                    {sourceFunds.map(f => (
                      <div key={f.id} className="flex-1 flex justify-center">
                        <StarRating rating={f.geojitRating} size={8} />
                      </div>
                    ))}
                    {gr.replacements.map(rep => (
                      <div key={rep.id} className="flex-1 flex justify-center">
                        <StarRating rating={rep.geojitRating} size={8} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── INDIVIDUAL MODE — original switch pairs ─── */
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Switch Orders</p>
            <div className="space-y-3">
              {selectedResults.map(result => {
                const sourceFund = userHoldings.find(f => f.id === result.sourceFundId);
                if (!sourceFund) return null;
                const sourceNav = sourceFund.nav ?? 100;
                const units = parseFloat((sourceFund.holdingValue / sourceNav).toFixed(3));
                const defaultAlloc = getModelAllocations(result.replacements, modelToUse, Math.round(units * 1000));
                const isExpanded = expandedRow === result.sourceFundId;

                return (
                  <div key={result.sourceFundId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      onClick={() => setExpandedRow(isExpanded ? null : result.sourceFundId)}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: sourceFund.amcColor }}
                      >
                        {sourceFund.amcInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{sourceFund.fundName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Sell {units.toFixed(3)} units → {result.replacements.length} buy order{result.replacements.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-brand-red">{formatINR(sourceFund.holdingValue)}</p>
                        {isExpanded ? <ChevronUp size={14} className="text-gray-400 ml-auto mt-0.5" /> : <ChevronDown size={14} className="text-gray-400 ml-auto mt-0.5" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-50 px-4 py-3 space-y-3 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">REDEEM</span>
                          <span className="text-xs text-gray-600 flex-1 truncate">{sourceFund.fundName}</span>
                          <span className="text-xs font-bold text-gray-800">{units.toFixed(3)} units</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 ml-1">
                          <span>NAV ₹{sourceNav.toFixed(4)}</span>
                          <span>•</span>
                          <span>Value {formatINR(sourceFund.holdingValue)}</span>
                        </div>

                        <div className="flex items-center gap-2 ml-1">
                          <ArrowRight size={12} className="text-brand-green" />
                          <span className="text-[10px] font-bold text-green-700">Purchase Orders</span>
                        </div>
                        {result.replacements.map(rep => {
                          const fund = getReplacementFund(rep.id);
                          if (!fund) return null;
                          const repUnits = parseFloat(((modelUnits[sourceFund.id]?.[fund.id] ?? (defaultAlloc[fund.id] ?? 0)) / 1000).toFixed(3));
                          const fundNav = fund.nav ?? 100;
                          return (
                            <div key={fund.id} className="bg-white rounded-xl p-3 border border-green-100">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                                  style={{ backgroundColor: fund.amcColor }}
                                >
                                  {fund.amcInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">{fund.fundName}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <StarRating rating={fund.geojitRating} size={9} />
                                    {fund.badge && (
                                      <span className={cn(
                                        'text-[9px] px-1 py-0.5 rounded font-bold',
                                        fund.badge === 'Gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                                      )}>{fund.badge}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-green-700">{repUnits.toFixed(3)} units</p>
                                  <p className="text-[9px] text-gray-400">NAV ₹{fundNav.toFixed(4)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ORDER MODE SELECTION ─────────────────── */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">How to Place Orders</p>
          <div className="space-y-2.5">

            <div
              className={cn(
                'bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all',
                orderMode === 'instant_credit' ? 'border-green-500 shadow-sm' : 'border-gray-100 hover:border-gray-200'
              )}
              onClick={() => setOrderMode('instant_credit')}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  orderMode === 'instant_credit' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                )}>
                  {orderMode === 'instant_credit' && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-green-600" />
                    <p className="text-sm font-bold text-gray-900">Instant Order with Broker Credit</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Your broker provides <span className="font-semibold text-green-700">same-day credit</span> against the redemption proceeds. Both sell and buy orders are placed and executed <span className="font-semibold">today</span>.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">⚡ Same-day execution</span>
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">No wait</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowModeInfo(showModeInfo === 'instant_credit' ? null : 'instant_credit'); }}
                    className="mt-2 flex items-center gap-1 text-[10px] text-blue-500 font-medium"
                  >
                    <Info size={11} /> {showModeInfo === 'instant_credit' ? 'Hide details' : 'How does this work?'}
                  </button>
                  {showModeInfo === 'instant_credit' && (
                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-blue-800 leading-relaxed">
                        Your broker extends a short-term credit line equal to the redemption amount. This lets you buy the new funds immediately without waiting for the sold units to settle. The credit is automatically squared off when settlement completes (T+2 to T+3 business days).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={cn(
                'bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all',
                orderMode === 'wait_settlement' ? 'border-amber-500 shadow-sm' : 'border-gray-100 hover:border-gray-200'
              )}
              onClick={() => setOrderMode('wait_settlement')}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  orderMode === 'wait_settlement' ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                )}>
                  {orderMode === 'wait_settlement' && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-600" />
                    <p className="text-sm font-bold text-gray-900">Place After Settlement</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Sell orders are placed today. <span className="font-semibold text-amber-700">Buy orders are queued</span> and executed automatically after your redemption proceeds are credited (T+2 / T+3 business days).
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">⏳ Buy after T+2/T+3</span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">No credit cost</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowModeInfo(showModeInfo === 'wait_settlement' ? null : 'wait_settlement'); }}
                    className="mt-2 flex items-center gap-1 text-[10px] text-blue-500 font-medium"
                  >
                    <Info size={11} /> {showModeInfo === 'wait_settlement' ? 'Hide details' : 'How does this work?'}
                  </button>
                  {showModeInfo === 'wait_settlement' && (
                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-blue-800 leading-relaxed">
                        Your sell orders are placed immediately at today's NAV. The proceeds typically settle in 2–3 business days. Once credited, the queued buy orders will automatically execute. This avoids any credit cost but means you'll be out of the market for 2–3 days.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 bg-gradient-to-t from-gray-100 to-transparent space-y-2">
        <button
          onClick={handleConfirm}
          disabled={submitting || !orderMode}
          className={cn(
            'w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl shadow-lg transition-all',
            orderMode
              ? orderMode === 'instant_credit'
                ? 'bg-brand-green text-white hover:bg-green-700 active:scale-[0.98]'
                : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Processing...</>
          ) : orderMode === 'instant_credit' ? (
            <><Zap size={16} /> Place All Orders Now</>
          ) : orderMode === 'wait_settlement' ? (
            <><Clock size={16} /> Sell Now, Buy After Settlement</>
          ) : (
            <>Select an order mode above</>
          )}
        </button>
        <button
          onClick={() => { reset(); navigate('/'); }}
          className="w-full text-center text-xs text-gray-400 py-1 hover:text-gray-600"
        >
          Cancel — exit without placing orders
        </button>
      </div>
    </div>
  );
}

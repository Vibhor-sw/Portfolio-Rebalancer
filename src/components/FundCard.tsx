import type { Fund, RatingTier } from '../types/rebalancer';
import { formatINR, formatPnL, getTierColor } from '../utils/formatters';
import { StarRating } from './ui/StarRating';
import { TrendingUp, TrendingDown, Zap, ExternalLink } from 'lucide-react';
import { cn } from '../utils/cn';

interface FundCardProps {
  fund: Fund;
  tier: RatingTier;
  showSwitchButton?: boolean;
  onSwitch?: (fund: Fund) => void;
  selected?: boolean;
  onSelect?: (fund: Fund, selected: boolean) => void;
  showCheckbox?: boolean;
}

export function FundCard({
  fund,
  tier,
  showSwitchButton,
  onSwitch,
  selected,
  onSelect,
  showCheckbox,
}: FundCardProps) {
  const pnl = fund.holdingValue - fund.investedValue;
  const pnlFormatted = formatPnL(pnl);
  const dotColor = getTierColor(tier);
  const isPositive = fund.xirr >= 0;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-4 shadow-sm border transition-all',
        selected ? 'border-brand-green ring-1 ring-brand-green' : 'border-gray-100',
        showCheckbox && 'cursor-pointer'
      )}
      onClick={() => showCheckbox && onSelect?.(fund, !selected)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <div
            className={cn(
              'mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              selected ? 'border-brand-green bg-brand-green' : 'border-gray-300'
            )}
          >
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}

        {/* AMC Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: fund.amcColor }}
        >
          {fund.amcInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{fund.fundName}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {fund.isExternal && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Ext</span>
              )}
              {fund.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-bold',
                    fund.badge === 'Gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {fund.badge}
                </span>
              )}
            </div>
          </div>

          {/* Sub info */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <span className="text-xs text-gray-500">{fund.subCategory}</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-500">{fund.plan}</span>
          </div>
        </div>
      </div>

      {/* Ratings row */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium">GJ</span>
          <StarRating rating={fund.geojitRating} size={11} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium">MS</span>
          <StarRating rating={fund.morningstarRating} size={11} />
        </div>
        {fund.sipStatus && (
          <span
            className={cn(
              'ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium',
              fund.sipStatus === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            )}
          >
            SIP {fund.sipStatus}
          </span>
        )}
      </div>

      {/* Values */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Current Value</p>
          <p className="text-sm font-bold text-gray-900">{formatINR(fund.holdingValue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">P&amp;L</p>
          <p className={cn('text-sm font-semibold', pnlFormatted.positive ? 'text-brand-green' : 'text-brand-red')}>
            {pnlFormatted.text}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">XIRR</p>
          <div className="flex items-center gap-0.5">
            {isPositive ? (
              <TrendingUp size={12} className="text-brand-green" />
            ) : (
              <TrendingDown size={12} className="text-brand-red" />
            )}
            <p className={cn('text-sm font-semibold', isPositive ? 'text-brand-green' : 'text-brand-red')}>
              {Math.abs(fund.xirr).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* CAGR row */}
      {(fund.cagr1Y != null || fund.cagr3Y != null || fund.cagr5Y != null) && (
        <div className="mt-2 flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
          {fund.cagr1Y != null && (
            <div className="text-center">
              <p className="text-[9px] text-gray-400">1Y</p>
              <p className="text-xs font-semibold text-gray-700">{fund.cagr1Y.toFixed(1)}%</p>
            </div>
          )}
          {fund.cagr3Y != null && (
            <div className="text-center">
              <p className="text-[9px] text-gray-400">3Y</p>
              <p className="text-xs font-semibold text-gray-700">{fund.cagr3Y.toFixed(1)}%</p>
            </div>
          )}
          {fund.cagr5Y != null && (
            <div className="text-center">
              <p className="text-[9px] text-gray-400">5Y</p>
              <p className="text-xs font-semibold text-gray-700">{fund.cagr5Y.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}

      {/* Switch button */}
      {showSwitchButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwitch?.(fund);
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-green text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-green-700 active:scale-95 transition-all"
        >
          <Zap size={14} />
          View Switch Options
        </button>
      )}
    </div>
  );
}

// Replacement fund card (used in SwitchOptions)
interface ReplacementCardProps {
  fund: Fund;
  units: number;
  onUnitsChange: (units: number) => void;
}

export function ReplacementCard({ fund, units, onUnitsChange }: ReplacementCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: fund.amcColor }}
        >
          {fund.amcInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{fund.fundName}</p>
          <div className="flex items-center gap-2 mt-1">
            {fund.badge && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-bold',
                fund.badge === 'Gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
              )}>
                {fund.badge}
              </span>
            )}
            <span className="text-xs text-gray-500">{fund.subCategory}</span>
          </div>
        </div>
        <ExternalLink size={14} className="text-gray-400 flex-shrink-0 mt-1" />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium">GJ</span>
          <StarRating rating={fund.geojitRating} size={11} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium">MS</span>
          <StarRating rating={fund.morningstarRating} size={11} />
        </div>
      </div>

      {(fund.cagr1Y != null || fund.cagr3Y != null || fund.cagr5Y != null) && (
        <div className="mt-2 flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
          {fund.cagr1Y != null && (
            <div className="text-center">
              <p className="text-[9px] text-gray-400">1Y CAGR</p>
              <p className="text-xs font-semibold text-green-700">{fund.cagr1Y.toFixed(1)}%</p>
            </div>
          )}
          {fund.cagr3Y != null && (
            <div className="text-center">
              <p className="text-[9px] text-gray-400">3Y CAGR</p>
              <p className="text-xs font-semibold text-green-700">{fund.cagr3Y.toFixed(1)}%</p>
            </div>
          )}
          {fund.cagr5Y != null && (
            <div className="text-center">
              <p className="text-[9px] text-gray-400">5Y CAGR</p>
              <p className="text-xs font-semibold text-green-700">{fund.cagr5Y.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}

      {/* Units allocation */}
      <div className="mt-3 flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
        <span className="text-xs font-medium text-green-800">Units to Switch</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUnitsChange(Math.max(0, units - 1))}
            className="w-7 h-7 rounded-full bg-white border border-green-200 flex items-center justify-center text-green-700 font-bold text-sm hover:bg-green-100 active:scale-95"
          >
            −
          </button>
          <input
            type="number"
            value={units}
            onChange={(e) => onUnitsChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 text-center text-sm font-bold text-gray-900 bg-white border border-green-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <button
            onClick={() => onUnitsChange(units + 1)}
            className="w-7 h-7 rounded-full bg-white border border-green-200 flex items-center justify-center text-green-700 font-bold text-sm hover:bg-green-100 active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

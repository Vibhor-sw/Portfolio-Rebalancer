import { useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/formatters';
import { userHoldings } from '../data/mockData';
import { TrendingUp, ArrowRight, Bell } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const totalHolding = userHoldings.reduce((s, f) => s + f.holdingValue, 0);
  const totalInvested = userHoldings.reduce((s, f) => s + f.investedValue, 0);
  const pnl = totalHolding - totalInvested;

  return (
    <div className="flex flex-col pb-20">
      <div className="bg-gradient-to-br from-green-700 to-green-900 px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-200 text-xs font-medium">Good morning,</p>
            <h1 className="text-white text-xl font-bold">Investor</h1>
          </div>
          <button className="relative p-2">
            <Bell size={20} className="text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <p className="text-green-200 text-xs mb-1">Total Portfolio Value</p>
          <p className="text-white text-3xl font-bold">{formatINR(totalHolding)}</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp size={14} className="text-green-300" />
            <span className="text-green-300 text-sm font-semibold">+{formatINR(pnl)} overall</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate('/portfolio')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">View Portfolio</p>
              <p className="text-xs text-gray-500 mt-0.5">{userHoldings.length} funds • Full analysis</p>
            </div>
            <ArrowRight size={18} className="text-gray-400" />
          </div>
        </div>

        <div
          className="bg-red-50 border border-red-200 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate('/fund-rating-insights', { state: { tab: 'Need Attention' } })}
        >
          <p className="text-sm font-bold text-red-800">Rebalance Needed</p>
          <p className="text-xs text-red-600 mt-0.5">3 low-rated funds need your attention</p>
          <button className="mt-2 text-xs font-semibold text-red-700 flex items-center gap-1">
            Start Rebalancing <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

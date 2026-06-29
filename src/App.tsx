import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Portfolio } from './pages/Portfolio';
import { FundRatingInsights } from './pages/FundRatingInsights';
import { SwitchOptions } from './pages/SwitchOptions';
import { RebalanceConsent } from './pages/RebalanceConsent';
import { RebalanceConfirm } from './pages/RebalanceConfirm';

function Explore() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-sm">Explore coming soon</p>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-sm">Profile coming soon</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Home /><BottomNav /></>} />
        <Route path="/portfolio" element={<><Portfolio /><BottomNav /></>} />
        <Route path="/explore" element={<><Explore /><BottomNav /></>} />
        <Route path="/profile" element={<><ProfilePage /><BottomNav /></>} />
        <Route path="/fund-rating-insights" element={<FundRatingInsights />} />
        <Route path="/switch-options" element={<SwitchOptions />} />
        <Route path="/rebalance-consent" element={<RebalanceConsent />} />
        <Route path="/rebalance-confirm" element={<RebalanceConfirm />} />
      </Routes>
    </BrowserRouter>
  );
}

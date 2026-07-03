import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function WhatIfFab() {
  const navigate = useNavigate();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
      <div className="pointer-events-none relative w-full max-w-md">
        <button
          onClick={() => navigate("/whatif")}
          aria-label="Open WhatIf Simulator"
          className="pointer-events-auto absolute right-4 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="h-4 w-4" />
          What If
        </button>
      </div>
    </div>
  );
}

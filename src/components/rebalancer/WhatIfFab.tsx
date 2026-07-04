import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function WhatIfFab() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-x-0 z-40 flex justify-center"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="flex w-full max-w-md justify-end px-4">
        <button
          onClick={() => navigate("/whatif")}
          aria-label="Open WhatIf Simulator"
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-2xl ring-4 ring-primary/25 transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          What If
        </button>
      </div>
    </div>
  );
}

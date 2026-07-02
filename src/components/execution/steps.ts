export type ExecutionModeVariant = "conservative" | "instant" | "smart_partial";

export const STEPS_BY_MODE: Record<ExecutionModeVariant, string[]> = {
  conservative: ["Sell Orders Submitted", "Settlement in Progress (T+1)", "Buy Orders Queued", "Rebalancing Complete"],
  instant: ["Sell Orders Submitted", "Buy Orders Executed (provisional credit)", "Awaiting Reconciliation (T+1)", "Rebalancing Complete"],
  smart_partial: ["Sell Orders Submitted", "Liquid Buys Executed (60% instantly)", "Remaining Buys Queued", "Rebalancing Complete"],
};

export const ACTION_LABEL_BY_MODE: Record<ExecutionModeVariant, string> = {
  conservative: "Settle Now",
  instant: "Take Provisional Credit and Buy",
  smart_partial: "Settle Now",
};

export function statusForOrder(mode: ExecutionModeVariant, orderType: "SELL" | "BUY", currentStep: number, totalSteps: number): string {
  const isComplete = currentStep >= totalSteps - 1;
  if (isComplete) return orderType === "SELL" ? "settled" : "executed";

  if (orderType === "SELL") {
    return currentStep === 0 ? "submitted" : "settling";
  }

  if (mode === "conservative") {
    if (currentStep < 2) return "queued";
    return "settling";
  }
  if (mode === "instant") {
    if (currentStep < 1) return "queued";
    return "executed";
  }
  // smart_partial
  if (currentStep < 1) return "queued";
  return "executed";
}

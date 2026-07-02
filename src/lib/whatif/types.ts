export interface WhatIfTableRow {
  label: string;
  currentPercent: number;
  newPercent: number;
  currentValue: number;
  newValue: number;
}

export interface WhatIfAction {
  label: string;
  kind: "apply_qty_adjustments" | "switch_model" | "add_cash" | "navigate_rebalancer";
  payload?: Record<string, unknown>;
}

export interface WhatIfResponse {
  message: string;
  table?: WhatIfTableRow[];
  relatedQuestions?: string[];
  actions?: WhatIfAction[];
  inScope: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  table?: WhatIfTableRow[];
  relatedQuestions?: string[];
  actions?: WhatIfAction[];
  timestamp: number;
}

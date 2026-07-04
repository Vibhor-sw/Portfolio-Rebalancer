import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Send, PenLine } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageBubble } from "@/components/whatif/ChatMessage";
import { TypingIndicator } from "@/components/whatif/TypingIndicator";
import { getContextualQuestions } from "@/lib/whatif/questions";
import { generateWhatIfResponse } from "@/lib/whatif/engine";
import type { ChatMessage, WhatIfAction } from "@/lib/whatif/types";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useHoldings } from "@/contexts/HoldingsContext";
import { useRebalance } from "@/contexts/RebalanceContext";
import { generateRecommendations } from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";
import type { ModelKey } from "@/lib/types";

export default function WhatIf() {
  const navigate = useNavigate();
  const { selectedPortfolio } = usePortfolio();
  const { holdings } = useHoldings();
  const rebalance = useRebalance();

  const { stocks, mutualFunds } = holdings[selectedPortfolio];
  const model = INVESTMENT_MODELS.find((m) => m.key === rebalance.selectedModel) ?? INVESTMENT_MODELS[0];

  const { stockRecos, mfRecos } = generateRecommendations(stocks, mutualFunds, model, {
    additionalCash: rebalance.additionalCash,
    qtyAdjustments: rebalance.qtyAdjustments,
  });
  const suggestedQuestions = getContextualQuestions(stockRecos, mfRecos, model.key);

  const [mode, setMode] = React.useState<"landing" | "chat">("landing");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setMode("chat");
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateWhatIfResponse(trimmed, { stocks, mfs: mutualFunds, model });
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: response.message,
        table: response.table,
        relatedQuestions: response.relatedQuestions,
        actions: response.actions,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 700 + Math.random() * 500);
  };

  const handleAction = (action: WhatIfAction) => {
    if (action.kind === "apply_qty_adjustments") {
      const payload = action.payload as { qtyAdjustments: Record<string, number>; rebalanceScope: "stocks" | "mutualFunds" | "both" };
      Object.entries(payload.qtyAdjustments).forEach(([id, qty]) => rebalance.setQtyAdjustment(id, qty));
      rebalance.setRebalanceScope(payload.rebalanceScope);
      toast.success("Applied to Rebalancer — review before confirming orders");
      navigate("/rebalancer");
    } else if (action.kind === "switch_model") {
      const payload = action.payload as { model: ModelKey };
      rebalance.setSelectedModel(payload.model);
      toast.success("Model switched");
      navigate("/rebalancer");
    } else if (action.kind === "add_cash") {
      const payload = action.payload as { amount: number };
      rebalance.setAdditionalCash(payload.amount);
      toast.success("Cash added to rebalancing pool");
      navigate("/rebalancer");
    }
  };

  if (mode === "landing") {
    return (
      <MobileShell>
        <div className="space-y-5">
          <Card className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <CardContent className="space-y-2 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-base font-bold">WhatIf Simulator</p>
              <p className="text-xs opacity-90">
                Ask any what-if question about your rebalanced mix — sector shifts, risk profile changes, or adding
                fresh capital — and see the simulated impact instantly.
              </p>
            </CardContent>
          </Card>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Based on your rebalanced mix
            </p>
            <div className="space-y-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm hover:border-primary hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setMode("chat")}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-primary"
          >
            <PenLine className="h-4 w-4" /> I wish to type my own question
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="flex flex-col px-0">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} onRelatedQuestion={sendMessage} onAction={handleAction} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>
      <div className="sticky bottom-16 flex items-center gap-2 border-t border-border bg-background px-4 py-3">
        <Input
          placeholder="Ask a what-if question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <Button size="icon" onClick={() => sendMessage(input)} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </MobileShell>
  );
}

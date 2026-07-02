import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ChatMessage as ChatMessageT } from "@/lib/whatif/types";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageT;
  onRelatedQuestion: (q: string) => void;
  onAction: (action: NonNullable<ChatMessageT["actions"]>[number]) => void;
}

export function ChatMessageBubble({ message, onRelatedQuestion, onAction }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] space-y-2", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
          )}
        >
          {message.text}
        </div>

        {message.table && message.table.length > 0 && (
          <div className="w-full overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Bucket</TableHead>
                  <TableHead className="text-right text-[10px]">Current</TableHead>
                  <TableHead className="text-right text-[10px]">New</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {message.table.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="text-[11px] font-medium">{row.label}</TableCell>
                    <TableCell className="text-right text-[11px]">
                      {formatPercent(row.currentPercent)}
                      <br />
                      <span className="text-muted-foreground">{formatCurrency(row.currentValue, { compact: true })}</span>
                    </TableCell>
                    <TableCell className="text-right text-[11px] font-medium text-primary">
                      {formatPercent(row.newPercent)}
                      <br />
                      <span className="text-muted-foreground">{formatCurrency(row.newValue, { compact: true })}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((action, idx) => (
              <Button key={idx} size="sm" variant="secondary" className="gap-1" onClick={() => onAction(action)}>
                {action.label} <ArrowRight className="h-3 w-3" />
              </Button>
            ))}
          </div>
        )}

        {message.relatedQuestions && message.relatedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.relatedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onRelatedQuestion(q)}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ExecutionModeVariant } from "./steps";
import { STEPS_BY_MODE } from "./steps";

interface ExecutionTimelineProps {
  mode: ExecutionModeVariant;
  currentStep: number;
}

export function ExecutionTimeline({ mode, currentStep }: ExecutionTimelineProps) {
  const steps = STEPS_BY_MODE[mode];
  const progress = (Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-4">
      <Progress value={progress} />
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div key={step} className="flex items-start gap-3">
              {isDone ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : isActive ? (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <p className={cn("text-sm", isDone && "text-muted-foreground line-through", isActive && "font-medium")}>{step}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import * as React from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileShell({ children, showBottomNav = true, className }: MobileShellProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-background">
      <Header />
      <main className={cn("flex-1 px-4 py-6", showBottomNav ? "pb-24" : "pb-8", className)}>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

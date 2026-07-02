import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { Home, SlidersHorizontal, BookOpen, HelpCircle, Settings as SettingsIcon, LogOut, X, MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import { USER_PROFILE } from "@/lib/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MENU_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/rebalancer", label: "Rebalancer", icon: SlidersHorizontal },
  { to: "/whatif", label: "WhatIf Simulator", icon: MessageCircleQuestion },
  { to: "/how-it-works", label: "How It Works", icon: BookOpen },
  { to: "/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function SideDrawer({ open, onOpenChange }: SideDrawerProps) {
  const navigate = useNavigate();

  const handleNavigate = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  const handleLogout = () => {
    onOpenChange(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-card p-4 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200">
          <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{USER_PROFILE.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{USER_PROFILE.name}</p>
                <p className="text-xs text-muted-foreground">{USER_PROFILE.profession}</p>
              </div>
            </div>
            <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => handleNavigate(to)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

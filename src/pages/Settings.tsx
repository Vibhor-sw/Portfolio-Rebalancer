import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { KeyRound, Fingerprint, Hash, Workflow, LogOut, Printer, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTheme, type ThemeName } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const FLOW_STEPS = [
  "START",
  "Splash",
  "Login",
  "Dashboard",
  "Optimizer Dialog: Choose Portfolio Composition (Only Stocks / Only MFs / Stocks + MFs)",
  "Choose Flow Type: User Consent or User Defined Customization",
  "Instrument Selection Logic + CTA Enablement Rules",
  "Results Page (Rebalancer)",
  "END",
];

const THEMES: { key: ThemeName; label: string; swatch: string }[] = [
  { key: "light", label: "Light", swatch: "bg-white border border-border" },
  { key: "dark", label: "Dark", swatch: "bg-slate-900" },
  { key: "blue", label: "Blue", swatch: "bg-blue-600" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mpin, setMpin] = React.useState(false);
  const [biometric, setBiometric] = React.useState(false);
  const [flowOpen, setFlowOpen] = React.useState(false);
  const [defaultMode, setDefaultMode] = React.useState<string>(localStorage.getItem("defaultExecutionMode") || "conservative");

  React.useEffect(() => {
    const handler = () => setDefaultMode(localStorage.getItem("defaultExecutionMode") || "conservative");
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  const handleTheme = (t: ThemeName) => {
    setTheme(t);
    toast.success(`Theme set to ${t}`);
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <MobileShell>
      <h1 className="mb-4 text-lg font-bold">Settings</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.success("Password change flow simulated")}>
              <KeyRound className="h-4 w-4" /> Change Password
            </Button>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" /> MPIN
              </span>
              <Switch checked={mpin} onCheckedChange={(v) => { setMpin(v); toast.success(v ? "MPIN enabled" : "MPIN disabled"); }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Fingerprint className="h-4 w-4 text-muted-foreground" /> Biometric Login
              </span>
              <Switch
                checked={biometric}
                onCheckedChange={(v) => {
                  setBiometric(v);
                  toast.success(v ? "Biometric login enabled" : "Biometric login disabled");
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTheme(t.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors",
                    theme === t.key ? "border-primary bg-accent" : "border-border"
                  )}
                >
                  <span className={cn("h-6 w-6 rounded-full", t.swatch)} />
                  {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Rebalancer Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => navigate("/execution-mode", { state: { from: "settings" } })}
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm"
            >
              <span>
                Default Execution Mode
                <span className="ml-2 text-xs text-muted-foreground capitalize">({defaultMode})</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <button
              onClick={() => setFlowOpen(true)}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Workflow className="h-4 w-4" /> Application Flow Diagram
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <Dialog open={flowOpen} onOpenChange={setFlowOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Application Flow Diagram</DialogTitle>
          </DialogHeader>
          <div id="flow-diagram-print" className="space-y-2">
            {FLOW_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  {idx < FLOW_STEPS.length - 1 && <span className="h-6 w-px bg-border" />}
                </div>
                <p className="pt-0.5 text-xs">{step}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}

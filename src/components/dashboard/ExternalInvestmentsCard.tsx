import * as React from "react";
import { toast } from "sonner";
import { Info, RefreshCw, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { useExternalInvestment } from "@/contexts/ExternalInvestmentContext";

type FetchStep = "closed" | "details" | "otp";

export function ExternalInvestmentsCard() {
  const { investments, hasFetched, isFetching, fetchExternalInvestments, refreshExternalInvestments } =
    useExternalInvestment();
  const [step, setStep] = React.useState<FetchStep>("closed");
  const [pan, setPan] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [isRefresh, setIsRefresh] = React.useState(false);

  const openFetch = () => {
    setIsRefresh(false);
    setStep("details");
  };
  const openRefresh = () => {
    setIsRefresh(true);
    setStep("otp");
  };

  const handleSubmitDetails = () => {
    if (pan.trim().length !== 10) {
      toast.error("PAN must be exactly 10 characters");
      return;
    }
    if (!dob) {
      toast.error("Please enter your date of birth");
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }
    if (isRefresh) {
      await refreshExternalInvestments();
      toast.success("External investments refreshed");
    } else {
      await fetchExternalInvestments();
      toast.success("Fetched from CAMS & KFintech");
    }
    setStep("closed");
    setPan("");
    setDob("");
    setOtp("");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-1.5">
            <CardTitle>External Equity Investments</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label="Info" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent>
                Pulls your Stocks and Equity Mutual Fund holdings held outside this app via CAMS &amp; KFintech.
                Resets on every application launch.
              </PopoverContent>
            </Popover>
          </div>
          {hasFetched && (
            <button
              onClick={openRefresh}
              aria-label="Refresh"
              disabled={isFetching}
              className="text-muted-foreground hover:text-primary disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
          )}
        </CardHeader>
        <CardContent>
          {!hasFetched ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
              <Landmark className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                See your complete equity picture by fetching investments held outside this app.
              </p>
              <Button onClick={openFetch} disabled={isFetching}>
                {isFetching ? "Fetching…" : "Fetch External Equity Investments"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {investments.map((inv) => {
                const pl = inv.currentValue - inv.investedValue;
                const plPercent = (pl / inv.investedValue) * 100;
                return (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">{inv.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(inv.currentValue)}</p>
                      <p className={cn("text-xs", pl >= 0 ? "text-success" : "text-destructive")}>
                        {pl >= 0 ? "+" : ""}
                        {formatPercent(plPercent, { showSign: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={step === "details"} onOpenChange={(o) => !o && setStep("closed")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fetch External Investments</DialogTitle>
            <DialogDescription>Verify your identity to pull holdings from CAMS &amp; KFintech.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pan">PAN Number</Label>
              <Input id="pan" placeholder="ABCDE1234F" maxLength={10} value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitDetails}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={step === "otp"} onOpenChange={(o) => !o && setStep("closed")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>Enter the 6-digit OTP sent to your registered mobile number.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="ext-otp">OTP</Label>
            <Input id="ext-otp" maxLength={6} inputMode="numeric" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handleVerifyOtp} disabled={isFetching}>
              {isFetching ? "Verifying…" : "Verify OTP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

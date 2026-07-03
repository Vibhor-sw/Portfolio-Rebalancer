import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "identifier" | "credential";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<Step>("identifier");
  const [identifier, setIdentifier] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);
  const [credential, setCredential] = React.useState("");

  const handleContinue = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      toast.error("Please enter your username or mobile number");
      return;
    }
    const mobile = /^\d{10}$/.test(trimmed);
    if (/^\d+$/.test(trimmed) && !mobile) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }
    setIsMobile(mobile);
    setStep("credential");
  };

  const handleLogin = () => {
    const trimmed = credential.trim();
    if (!trimmed) {
      toast.error(isMobile ? "Please enter the OTP" : "Please enter your password");
      return;
    }
    if (isMobile && !/^\d{6}$/.test(trimmed)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }
    toast.success("Login successful");
    navigate("/dashboard");
  };

  const handleSkip = () => {
    toast.success("Signed in as demo user");
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-primary/40 p-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto w-full max-w-md rounded-3xl bg-background p-6 text-foreground shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Welcome back</p>
            <p className="text-xs text-muted-foreground">Sign in to Portfolio Rebalancer</p>
          </div>
        </div>

        {step === "identifier" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Username or Mobile Number</Label>
              <Input
                id="identifier"
                placeholder="Enter username or 10-digit mobile"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              />
            </div>
            <Button className="w-full" size="lg" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setStep("identifier")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <div className="space-y-1.5">
              <Label htmlFor="credential">{isMobile ? "Enter 6-digit OTP" : "Password"}</Label>
              <Input
                id="credential"
                type={isMobile ? "text" : "password"}
                inputMode={isMobile ? "numeric" : "text"}
                maxLength={isMobile ? 6 : undefined}
                placeholder={isMobile ? "••••••" : "Enter your password"}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              {isMobile && <p className="text-xs text-muted-foreground">OTP sent to {identifier}</p>}
            </div>
            <Button className="w-full" size="lg" onClick={handleLogin}>
              Login
            </Button>
          </div>
        )}

        <div className="mt-5 text-center">
          <button onClick={handleSkip} className="text-sm font-medium text-primary hover:underline">
            Skip for Demo
          </button>
        </div>
      </motion.div>
    </div>
  );
}

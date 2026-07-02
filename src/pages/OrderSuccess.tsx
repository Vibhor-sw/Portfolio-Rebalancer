import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <MobileShell showBottomNav={false}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <PartyPopper className="h-8 w-8 text-success" />
          </div>
        </motion.div>
        <h1 className="text-xl font-bold">Rebalancing Complete</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Your portfolio has been rebalanced as per plan. Updated holdings are now reflected in your dashboard.
        </p>
        <div className="mt-6 flex w-full max-w-xs gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/holdings")}>
            View Portfolio
          </Button>
          <Button className="flex-1" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}

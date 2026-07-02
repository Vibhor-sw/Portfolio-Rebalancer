import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur"
        >
          <TrendingUp className="h-10 w-10" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-bold tracking-tight"
        >
          Portfolio Rebalancer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm"
        >
          Smarter equity, effortlessly balanced
        </motion.p>
      </motion.div>
    </div>
  );
}

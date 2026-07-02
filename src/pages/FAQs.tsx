import { MobileShell } from "@/components/layout/MobileShell";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "What is portfolio rebalancing?",
    a: "Rebalancing means adjusting your portfolio's holdings so that the weights of your stocks and mutual funds match a target allocation — helping you manage risk and stay aligned with your investment goals.",
  },
  {
    q: "How often should I rebalance?",
    a: "Most investors benefit from reviewing their allocation quarterly, or whenever a single position drifts more than 5-10% from its target weight due to market movement.",
  },
  {
    q: "Does the app place trades automatically?",
    a: "No. Portfolio Rebalancer only generates recommendations. You review, adjust, and explicitly confirm every order before it's placed.",
  },
  {
    q: "What's the difference between the investment models?",
    a: "Balanced Alpha targets stronger growth with higher volatility, Smart Beta favours stability with large/flexi cap exposure, and Research-Driven allocates based on our highest-conviction research calls.",
  },
  {
    q: "How accurate are the recommendations?",
    a: "Recommendations are generated using rule-based allocation logic against your selected model's target mix. They are a starting point for your decision-making, not investment advice.",
  },
  {
    q: "Can I customize the target allocation?",
    a: "Yes. Use Advanced Settings in the Optimizer flow to select instruments and edit target percentages, as long as they total 100%.",
  },
  {
    q: "What happens if I ignore a recommendation?",
    a: "Nothing happens automatically. Recommendations you don't act on remain visible next time you open the Optimizer, and your portfolio stays unchanged until you confirm orders.",
  },
  {
    q: "Is there a fee for using Portfolio Rebalancer?",
    a: "Portfolio Rebalancer itself is free to use for analysis and recommendations. Standard brokerage and fund transaction charges apply when orders are placed.",
  },
];

export default function FAQs() {
  return (
    <MobileShell>
      <h1 className="mb-4 text-lg font-bold">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible>
        {FAQ_ITEMS.map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="text-sm">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </MobileShell>
  );
}

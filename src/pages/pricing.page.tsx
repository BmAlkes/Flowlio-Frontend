import { Navbar } from "@/components/user section/navbar/navbar";
import { Pricing } from "@/components/user section/pricing/pricing";
import { useEffect, useState } from "react";

export const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Pricing - Flowlio";
  }, []);
  return (
    <>
      <Navbar selectedPlan={selectedPlan} />
      <Pricing selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
    </>
  );
};

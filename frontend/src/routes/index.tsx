import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Steps } from "@/components/landing/steps";
import { Structure } from "@/components/landing/structure";
import { PlanPanel } from "@/components/landing/plan-panel";
import { Proof } from "@/components/landing/proof";
import { Pricing, type PricingChoice } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  component: Index,
});

// Funnel : accroche + aperçu réel → problème → comment tester la démo →
// ce que couvre le produit → planning → preuve → prix → formulaire → CTA.
function Index() {
  const [choice, setChoice] = useState<PricingChoice | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <Problem />
        <Steps />
        <Structure />
        <PlanPanel />
        <Proof />
        <Pricing onChoose={setChoice} />
        <FAQ />
        <Contact selection={choice} />
      </main>
      <Footer />
    </div>
  );
}

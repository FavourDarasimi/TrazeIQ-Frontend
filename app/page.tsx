import { Navbar } from "./_landing/navbar";
import { Hero } from "./_landing/hero";
import { TechStack } from "./_landing/tech-stack";
import { Problem } from "./_landing/problem";
import { Solution } from "./_landing/solution";
import { Features } from "./_landing/features";
import { HowItWorks } from "./_landing/how-it-works";
import { DashboardPreview } from "./_landing/dashboard-preview";
import { AIAssistant } from "./_landing/ai-assistant";
import { Timeline } from "./_landing/timeline";
import { DevSdk } from "./_landing/dev-sdk";
import { BuiltForScale } from "./_landing/built-for-scale";
import { Security } from "./_landing/security";
import { Faq } from "./_landing/faq";
import { Cta } from "./_landing/cta";
import { Footer } from "./_landing/footer";

export default function Home() {
  return (
    <main className="bg-bg">
      <Navbar />
      <Hero />
      <TechStack />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <AIAssistant />
      <Timeline />
      <DevSdk />
      <BuiltForScale />
      <Security />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}
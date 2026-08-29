import { Navbar } from "@/features/landing/components/navbar";
import { Hero } from "@/features/landing/components/hero";
import { TechStack } from "@/features/landing/components/tech-stack";
import { Problem } from "@/features/landing/components/problem";
import { Solution } from "@/features/landing/components/solution";
import { Features } from "@/features/landing/components/features";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { DashboardPreview } from "@/features/landing/components/dashboard-preview";
import { AIAssistant } from "@/features/landing/components/ai-assistant";
import { Timeline } from "@/features/landing/components/timeline";
import { DevIntegration } from "@/features/landing/components/dev-integration";
import { BuiltForScale } from "@/features/landing/components/built-for-scale";
import { Security } from "@/features/landing/components/security";
import { Faq } from "@/features/landing/components/faq";
import { Cta } from "@/features/landing/components/cta";
import { Footer } from "@/features/landing/components/footer";
import { AuthProvider } from "@/providers/auth-provider";

export default function Home() {
  return (
    <main className="bg-bg">
      <AuthProvider>
        <Navbar />
      </AuthProvider>
      <Hero />
      <TechStack />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <AIAssistant />
      <Timeline />
      <DevIntegration />
      <BuiltForScale />
      <Security />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}

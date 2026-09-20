import { Navbar } from "@/features/landing/components/navbar";
import { Hero } from "@/features/landing/components/hero";
import { Problem } from "@/features/landing/components/problem";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Features } from "@/features/landing/components/features";
import { DashboardPreview } from "@/features/landing/components/dashboard-preview";
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
      <Problem />
      <HowItWorks />
      <Features />
      <DashboardPreview />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}

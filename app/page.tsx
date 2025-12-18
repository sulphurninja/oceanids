import Header from "@/components/landing/Header"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Pricing from "@/components/landing/Pricing"
import FAQ from "@/components/landing/FAQ"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}

"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Shield, Waves } from "lucide-react"
import Link from "next/link"

export default function Pricing() {
  const features = [
    "Fresh IRCTC Account",
    "Verified & Working",
    "Instant Delivery",
    "24/7 Customer Support",
    "Free Replacement Guarantee",
    "Ready for Ticket Booking",
    "Secure Transaction",
    "Lifetime Access",
  ]

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      {/* Floating Orbs */}
      <div className="hero-orb w-[400px] h-[400px] bg-primary/10 top-[10%] left-[-10%]" />
      <div className="hero-orb w-[300px] h-[300px] bg-secondary/10 bottom-[20%] right-[-5%]" style={{ animationDelay: '3s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
            Simple Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            One Price, <span className="gradient-text">Everything Included</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            No hidden fees, no complicated tiers. Get a verified IRCTC account 
            with all features included at one simple price.
          </p>
        </motion.div>

        {/* Pricing Card - Centered Single Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 gradient-ocean rounded-3xl opacity-20 blur-xl" />
            
            {/* Card */}
            <div className="relative card-premium p-8 rounded-3xl border border-primary/20">
              {/* Popular Badge */}
              {/* <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full gradient-ocean text-white text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Best Value
                </div>
              </div> */}

              {/* Header */}
              <div className="text-center pt-4 pb-8 border-b border-border/50">
                <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-4">
                  <Waves className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">IRCTC Account</h3>
                <p className="text-muted-foreground">Verified & Ready to Use</p>
              </div>

              {/* Price */}
              <div className="py-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-muted-foreground text-lg line-through">₹599</span>
                  <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-sm font-medium">33% OFF</span>
                </div>
                <div className="mt-2">
                  <span className="text-6xl font-bold gradient-text">₹400</span>
                  <span className="text-muted-foreground ml-2">/account</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 pb-8">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/signup" className="block">
                <Button 
                  size="lg" 
                  className="w-full gradient-ocean text-white border-0 py-6 text-lg font-semibold btn-shine btn-glow"
                >
                  Get Your Account Now
                </Button>
              </Link>

              {/* Trust Note */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Secure payment via Cashfree • Instant delivery
              </p>
            </div>
          </div>
        </motion.div>

        {/* Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl glass border border-green-500/20">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-green-400">100% Replacement Guarantee</div>
              <div className="text-sm text-muted-foreground">If it doesn't work, we replace it free—no questions asked</div>
            </div>
          </div>
        </motion.div>

        {/* Additional Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
        >
          {[
            "Trusted by 5,000+ customers",
            "10,000+ accounts delivered",
            "99.9% success rate",
            "Average delivery: <5 minutes",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

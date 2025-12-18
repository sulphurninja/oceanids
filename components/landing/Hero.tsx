"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Shield, Zap, Clock, Users, CheckCircle2, Waves } from "lucide-react"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      {/* Animated Background Orbs */}
      <div className="hero-orb w-[600px] h-[600px] bg-primary/20 top-[-200px] left-[-200px]" />
      <div className="hero-orb w-[500px] h-[500px] bg-secondary/15 bottom-[-150px] right-[-150px]" style={{ animationDelay: '2s' }} />
      <div className="hero-orb w-[300px] h-[300px] bg-accent/10 top-[40%] right-[10%]" style={{ animationDelay: '4s' }} />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="container mx-auto px-4 py-32 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={item} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-sm">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-soft" />
              <span className="text-muted-foreground">Trusted by</span>
              <span className="font-semibold text-foreground">5,000+</span>
              <span className="text-muted-foreground">customers</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={item}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 text-balance"
          >
            <span className="text-foreground">Get Your </span>
            <span className="gradient-text">IRCTC</span>
            <br />
            <span className="text-foreground">Account </span>
            <span className="relative inline-block">
              <span className="gradient-text">Instantly</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="hsl(199 89% 48%)" />
                    <stop offset="50%" stopColor="hsl(258 90% 66%)" />
                    <stop offset="100%" stopColor="hsl(322 84% 55%)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={item}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance"
          >
            Skip the verification hassle. Get premium, verified IRCTC accounts 
            ready for instant train ticket booking. Delivered in under 5 minutes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="gradient-ocean text-white border-0 px-8 py-6 text-lg font-semibold btn-shine btn-glow group"
              >
                Get Account Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-border/50 hover:bg-muted/50 px-8 py-6 text-lg font-semibold"
              >
                View Pricing
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            variants={item}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm"
          >
            {[
              { icon: Shield, label: "100% Secure", color: "text-green-400" },
              { icon: Zap, label: "Instant Delivery", color: "text-primary" },
              { icon: Clock, label: "<5min Delivery", color: "text-secondary" },
              { icon: CheckCircle2, label: "Verified Accounts", color: "text-accent" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="card-premium card-glow p-1 rounded-2xl">
            <div className="bg-card rounded-xl p-6 sm:p-8">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                    <Waves className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Available Accounts</h3>
                    <p className="text-sm text-muted-foreground">Ready for instant delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </div>

              {/* Account Preview - Single Price at ₹400 */}
              <div className="space-y-3">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold block">IRCTC Account</span>
                      <span className="text-sm text-muted-foreground">Verified & Ready to Use</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold gradient-text">₹400</span>
                    <span className="text-xs text-green-500 block">In Stock</span>
                  </div>
                </motion.div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                {[
                  { value: "500+", label: "In Stock", color: "text-green-400" },
                  { value: "10,000+", label: "Sold", color: "text-primary" },
                  { value: "4.9★", label: "Rating", color: "text-yellow-400" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-24 py-8 border-t border-border/30"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16">
            {[
              { icon: Users, value: "5,000+", label: "Happy Customers" },
              { icon: Waves, value: "10,000+", label: "Accounts Sold" },
              { icon: Shield, value: "99.9%", label: "Success Rate" },
              { icon: Clock, value: "<5min", label: "Avg Delivery" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <stat.icon className="w-8 h-8 text-primary/60" />
                <div>
                  <span className="text-2xl font-bold block">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

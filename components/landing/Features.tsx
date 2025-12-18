"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Clock, Headphones, RefreshCw, CheckCircle, Lock, Fingerprint } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Delivery",
    description: "Get your account credentials in under 5 minutes. No waiting, no delays—instant access.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "100% Verified Accounts",
    description: "Every account is thoroughly tested and verified before delivery. Quality guaranteed.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Pay securely via UPI, cards, or net banking through Cashfree's PCI-DSS compliant gateway.",
    gradient: "from-primary to-blue-600",
  },
  {
    icon: Headphones,
    title: "24/7 Premium Support",
    description: "Our dedicated team is always here to help. Get instant assistance anytime, anywhere.",
    gradient: "from-secondary to-purple-600",
  },
  {
    icon: RefreshCw,
    title: "Instant Replacement",
    description: "Account not working? We'll replace it immediately—no questions asked, no extra cost.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: CheckCircle,
    title: "Ready to Book",
    description: "Start booking train tickets immediately. All accounts are pre-configured and ready to use.",
    gradient: "from-accent to-teal-500",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/20" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
            Why Choose Us
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Built for <span className="gradient-text">Reliability</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            We've perfected every aspect of the account delivery process to give you 
            the best experience possible.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group"
            >
              <div className="h-full card-premium card-hover card-glow p-6 rounded-2xl">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}>
                  <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
                    <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: 'transparent', backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl glass border border-border/50">
           ` {/* <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full gradient-ocean flex items-center justify-center text-white text-sm font-bold border-2 border-background"
                  style={{ zIndex: 4 - i }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>` */}
            <div className="text-left">
              <div className="font-semibold">Join 5,000+ satisfied customers</div>
              <div className="text-sm text-muted-foreground">Who trust OceanIDs for their IRCTC needs</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

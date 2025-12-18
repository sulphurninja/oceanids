"use client"

import Link from "next/link"
import { Waves, Mail, MessageCircle, ArrowUpRight, Heart } from "lucide-react"
import { motion } from "framer-motion"

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
  ],
  support: [
    { label: "Contact Us", href: "mailto:support@oceanids.com" },
    { label: "Help Center", href: "/#faq" },
  ],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient opacity-50" />
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 group mb-6">
              <motion.div 
                whileHover={{ rotate: 10 }}
                className="w-12 h-12 rounded-xl gradient-ocean flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <Waves className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">Ocean</span>
                <span className="text-foreground">IDs</span>
              </span>
            </Link>
            
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Your trusted source for premium IRCTC accounts. Instant delivery, 
              verified accounts, and round-the-clock support—all at ₹400.
            </p>

            {/* Social/Contact Links */}
            <div className="flex items-center gap-3">
              <a 
                href="mailto:support@oceanids.com" 
                className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OceanIDs. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Crafted with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  )
}

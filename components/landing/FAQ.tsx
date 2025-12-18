"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "How quickly will I receive my account?",
    answer: "Your account credentials will be delivered instantly after successful payment—usually within 2-5 minutes. You'll see them directly in your dashboard.",
  },
  {
    question: "Are these accounts safe and legal to use?",
    answer: "Yes! These are regular IRCTC accounts created through the official registration process. You can use them just like any other IRCTC account for booking train tickets.",
  },
  {
    question: "What if the account doesn't work?",
    answer: "We offer a 100% replacement guarantee. If your account doesn't work for any reason, contact our support team and we'll replace it immediately—no questions asked, no extra cost.",
  },
  {
    question: "Can I change the account password after purchase?",
    answer: "Absolutely! Once you receive the account, you have full control. You can change the password, update profile details, and customize everything through the official IRCTC website.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods including UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and digital wallets. All payments are processed securely through Cashfree.",
  },
  {
    question: "Is my payment information secure?",
    answer: "100% secure. We use industry-standard encryption and process all payments through Cashfree, which is PCI-DSS compliant. We never store your payment details.",
  },
  {
    question: "How do I contact support if I need help?",
    answer: "Our support team is available 24/7. You can reach us through the contact form in your dashboard, or via email. We typically respond within minutes during business hours.",
  },
  {
    question: "Do you offer bulk discounts?",
    answer: "Yes! If you need multiple accounts, contact our support team for special bulk pricing. We offer attractive discounts for orders of 5+ accounts.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/20" />
      <div className="absolute inset-0 bg-dots opacity-30" />

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
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Got <span className="gradient-text">Questions?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to know about OceanIDs. Can't find what you're looking for? 
            Our support team is here to help.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div 
                className={`card-premium rounded-xl overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'border-primary/30' : 'border-border/50'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={`w-5 h-5 ${openIndex === index ? 'text-primary' : 'text-muted-foreground'}`} />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-2xl glass border border-border/50">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-semibold text-lg mb-1">Still have questions?</div>
              <div className="text-muted-foreground">Our team is ready to help you 24/7</div>
            </div>
            <Button className="gradient-ocean text-white border-0 btn-shine">
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

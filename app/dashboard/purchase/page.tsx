"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, Shield, Check, Loader2, Sparkles,
  ArrowRight, AlertCircle, Train
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface Provider {
  _id: string
  slug: string
  name: string
  description: string
  price: number
  icon: string
  color: string
  features: string[]
  inStock: number
}

export default function PurchasePage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/providers")
      const data = await res.json()
      
      if (data.success && data.providers.length > 0) {
        setProviders(data.providers)
      } else {
        // Fallback default IRCTC provider
        setProviders([{
          _id: "irctc",
          slug: "irctc",
          name: "IRCTC",
          description: "Verified Indian Railways account for train ticket booking",
          price: 400,
          icon: "Train",
          color: "primary",
          features: [
            "Verified Account",
            "Instant Delivery",
            "24/7 Support",
            "Free Replacement",
            "Ready to Book",
          ],
          inStock: 0,
        }])
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
      // Fallback
      setProviders([{
        _id: "irctc",
        slug: "irctc",
        name: "IRCTC",
        description: "Verified Indian Railways account for train ticket booking",
        price: 400,
        icon: "Train",
        color: "primary",
        features: [
          "Verified Account",
          "Instant Delivery",
          "24/7 Support",
          "Free Replacement",
          "Ready to Book",
        ],
        inStock: 0,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (provider: Provider) => {
    setSelectedProvider(provider.slug)
    setProcessing(true)

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          provider: provider.slug,
          amount: provider.price 
        }),
      })

      const data = await res.json()

      if (data.success && data.paymentSessionId) {
        const cashfree = (window as any).Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox"
        })

        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_modal",
        }).then((result: any) => {
          if (result.error) {
            toast.error("Payment failed: " + result.error.message)
          } else if (result.paymentDetails) {
            toast.success("Payment successful! Redirecting...")
            router.push(`/payment/callback?order_id=${data.orderId}`)
          }
        })
      } else {
        toast.error(data.message || "Failed to create payment")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setProcessing(false)
      setSelectedProvider(null)
    }
  }

  const getProviderIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'train':
        return <Train className="w-7 h-7 text-white" />
      default:
        return <Package className="w-7 h-7 text-white" />
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Purchase Accounts</h1>
        <p className="text-muted-foreground">Select an account type to purchase</p>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-premium p-6 rounded-2xl animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-muted mb-4" />
              <div className="h-6 w-24 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded mb-6" />
              <div className="h-10 w-24 bg-muted rounded mb-6" />
              <div className="space-y-2 mb-6">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-4 w-full bg-muted rounded" />
                ))}
              </div>
              <div className="h-12 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Providers Grid */}
          <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => {
              const isSelected = selectedProvider === provider.slug
              const outOfStock = provider.inStock === 0

              return (
                <motion.div
                  key={provider._id}
                  whileHover={{ y: -4 }}
                  className="relative"
                >
                  <div className={`card-premium card-glow p-6 rounded-2xl h-full flex flex-col ${
                    outOfStock ? 'opacity-60' : ''
                  }`}>
                    {/* Badge */}
                    {provider.inStock > 0 && provider.inStock < 10 && (
                      <Badge className="absolute top-1 right-2 bg-yellow-500 text-yellow-950">
                        Only {provider.inStock} left
                      </Badge>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                      <div className="w-14 h-14 rounded-2xl gradient-ocean flex items-center justify-center mb-4">
                        {getProviderIcon(provider.icon)}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold gradient-text">₹{provider.price}</span>
                        <span className="text-muted-foreground">/account</span>
                      </div>
                      <div className="mt-2">
                        {outOfStock ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            {provider.inStock} in stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    {provider.features && provider.features.length > 0 && (
                      <ul className="space-y-3 mb-6 flex-1">
                        {provider.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-green-500" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <Button
                      size="lg"
                      disabled={outOfStock || processing}
                      onClick={() => handlePurchase(provider)}
                      className={`w-full ${
                        outOfStock 
                          ? '' 
                          : 'gradient-ocean text-white border-0 btn-shine'
                      }`}
                    >
                      {isSelected && processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : outOfStock ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          Buy Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* No Providers */}
          {providers.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accounts available</h3>
              <p className="text-muted-foreground">Check back later for new stock</p>
            </div>
          )}
        </>
      )}

      {/* Trust Badges */}
      <motion.div variants={item}>
        <div className="flex flex-wrap items-center justify-center gap-6 py-8 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Instant Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-5 h-5 text-green-500" />
            <span>100% Replacement Guarantee</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

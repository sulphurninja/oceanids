"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, Loader2, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Provider {
  _id: string
  slug: string
  name: string
  description: string
  price: number
  isActive: boolean
  icon: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function PricingPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrices, setEditPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/providers")
      const data = await res.json()
      if (data.success) {
        setProviders(data.providers)
        const prices: Record<string, number> = {}
        data.providers.forEach((p: Provider) => {
          prices[p._id] = p.price
        })
        setEditPrices(prices)
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
      toast.error("Failed to fetch pricing data")
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (id: string, price: number) => {
    setEditPrices(prev => ({
      ...prev,
      [id]: price
    }))
  }

  const handleSavePrice = async (id: string) => {
    const newPrice = editPrices[id]
    if (!newPrice || newPrice < 0) {
      toast.error("Please enter a valid price")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice })
      })
      const data = await res.json()
      if (data.success) {
        setProviders(providers.map(p => p._id === id ? { ...p, price: newPrice } : p))
        setEditingId(null)
        toast.success("Price updated successfully!")
      } else {
        toast.error(data.message || "Failed to update price")
      }
    } catch (error) {
      console.error("Error updating price:", error)
      toast.error("Failed to update price")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-primary" />
              Pricing Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Update pricing for all account types. These rates will be applied to all purchases.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <div key={provider._id} className="card-premium p-6 rounded-xl border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{provider.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{provider.description || provider.slug}</p>
              </div>
              {provider.isActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-4">
              {editingId === provider._id ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Price (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">₹</span>
                      <Input
                        type="number"
                        min="0"
                        value={editPrices[provider._id] || 0}
                        onChange={(e) => handlePriceChange(provider._id, parseInt(e.target.value) || 0)}
                        className="text-lg font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleSavePrice(provider._id)}
                      disabled={saving}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingId(null)
                        setEditPrices(prev => ({
                          ...prev,
                          [provider._id]: provider.price
                        }))
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                    <p className="text-3xl font-bold text-primary">₹{provider.price}</p>
                  </div>

                  <Button
                    onClick={() => setEditingId(provider._id)}
                    variant="outline"
                    className="w-full"
                  >
                    Edit Price
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {providers.length === 0 && (
        <motion.div variants={item} className="card-premium p-12 rounded-xl text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No providers found. Create one to manage pricing.</p>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div variants={item} className="card-premium bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Tip:</strong> The prices you set here will be applied to all new purchases. Existing orders won't be affected by price changes.
        </p>
      </motion.div>
    </motion.div>
  )
}


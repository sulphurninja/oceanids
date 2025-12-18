"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Loader2, Save, Trash2, Edit2, X, 
  Package, Check, Settings
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
  isActive: boolean
  order: number
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    description: "",
    price: 400,
    features: "",
    isActive: true,
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/providers")
      const data = await res.json()
      if (data.success) {
        setProviders(data.providers)
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleAddProvider = async () => {
    if (!formData.slug || !formData.name || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Provider added successfully")
        setProviders([...providers, data.provider])
        setShowAddForm(false)
        resetForm()
      } else {
        toast.error(data.message || "Failed to add provider")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProvider = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Provider updated successfully")
        setProviders(providers.map(p => p._id === id ? data.provider : p))
        setEditingId(null)
        resetForm()
      } else {
        toast.error(data.message || "Failed to update provider")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProvider = async (id: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return

    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Provider deleted")
        setProviders(providers.filter(p => p._id !== id))
      } else {
        toast.error(data.message || "Failed to delete provider")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleToggleActive = async (provider: Provider) => {
    try {
      const res = await fetch(`/api/admin/providers/${provider._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !provider.isActive }),
      })

      const data = await res.json()
      if (data.success) {
        setProviders(providers.map(p => p._id === provider._id ? data.provider : p))
        toast.success(`Provider ${data.provider.isActive ? 'activated' : 'deactivated'}`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const startEdit = (provider: Provider) => {
    setEditingId(provider._id)
    setShowAddForm(false)
    setFormData({
      slug: provider.slug,
      name: provider.name,
      description: provider.description,
      price: provider.price,
      features: provider.features.join(", "),
      isActive: provider.isActive,
    })
  }

  const resetForm = () => {
    setFormData({
      slug: "",
      name: "",
      description: "",
      price: 400,
      features: "",
      isActive: true,
    })
  }

  const activeCount = providers.filter(p => p.isActive).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Providers & Pricing</h1>
          <p className="text-muted-foreground">
            {providers.length} providers • {activeCount} active
          </p>
        </div>
        <Button 
          onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); }}
          className="gradient-ocean text-white border-0 btn-shine"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Total Providers</p>
          <p className="text-2xl font-bold mt-1">{providers.length}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-500">{activeCount}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold mt-1 text-muted-foreground">{providers.length - activeCount}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Avg. Price</p>
          <p className="text-2xl font-bold mt-1">
            ₹{providers.length > 0 ? Math.round(providers.reduce((s, p) => s + p.price, 0) / providers.length) : 0}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 rounded-xl border-primary/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              {editingId ? "Edit Provider" : "Add New Provider"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Slug (unique ID) *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="irctc"
                disabled={!!editingId}
              />
              <p className="text-xs text-muted-foreground mt-1">Used internally, cannot be changed later</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Display Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="IRCTC"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Verified account for train ticket booking"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Price (₹) *</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="400"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Features (comma separated)</label>
              <Input
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Verified, Instant Delivery, 24/7 Support"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button
              onClick={() => editingId ? handleUpdateProvider(editingId) : handleAddProvider()}
              disabled={saving}
              className="gradient-ocean text-white border-0"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update" : "Add"} Provider
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Providers List */}
      {loadingProviders ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : providers.length === 0 ? (
        <div className="card-premium p-12 rounded-xl text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No providers yet</h3>
          <p className="text-muted-foreground mb-4">Add your first provider to start selling accounts</p>
          <Button onClick={() => setShowAddForm(true)} className="gradient-ocean text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <motion.div
              key={provider._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card-premium p-5 rounded-xl ${!provider.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    provider.isActive ? 'gradient-ocean' : 'bg-muted'
                  }`}>
                    <Package className={`w-6 h-6 ${provider.isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {provider.slug}
                      </Badge>
                      {!provider.isActive && (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{provider.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-2xl font-bold text-primary">₹{provider.price}</p>
                    <p className="text-xs text-muted-foreground">per account</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(provider)}
                      title={provider.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {provider.isActive ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(provider)}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProvider(provider._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobile price */}
              <div className="sm:hidden mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-xl font-bold text-primary">₹{provider.price}</span>
              </div>

              {provider.features.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                  {provider.features.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

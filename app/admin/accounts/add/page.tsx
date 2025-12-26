"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Loader2, Upload, X, Check } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface AccountInput {
  username: string
  password: string
  provider: string
  price: number
  mobileNumber: string
  email: string
  notes: string
}

interface Provider {
  _id: string
  slug: string
  name: string
  price: number
}

const defaultAccount: AccountInput = {
  username: "",
  password: "",
  provider: "irctc",
  price: 400,
  mobileNumber: "",
  email: "",
  notes: "",
}

export default function AddAccountsPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [accounts, setAccounts] = useState<AccountInput[]>([{ ...defaultAccount }])
  const [bulkInput, setBulkInput] = useState("")
  const [bulkPassword, setBulkPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<"single" | "bulk">("single")
  const [selectedProvider, setSelectedProvider] = useState("irctc")

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/providers")
      const data = await res.json()
      if (data.success && data.providers.length > 0) {
        setProviders(data.providers)
        // Set default to first provider
        const firstProvider = data.providers[0]
        setSelectedProvider(firstProvider.slug)
        setAccounts([{ ...defaultAccount, provider: firstProvider.slug, price: firstProvider.price }])
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
    }
  }

  const addAccount = () => {
    const provider = providers.find(p => p.slug === selectedProvider)
    setAccounts([...accounts, { 
      ...defaultAccount, 
      provider: selectedProvider,
      price: provider?.price || 400 
    }])
  }

  const removeAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index))
  }

  const updateAccount = (index: number, field: keyof AccountInput, value: string | number) => {
    const updated = [...accounts]
    updated[index] = { ...updated[index], [field]: value }
    setAccounts(updated)
  }

  const handleProviderChange = (providerSlug: string) => {
    setSelectedProvider(providerSlug)
    const provider = providers.find(p => p.slug === providerSlug)
    // Update all accounts to use this provider
    setAccounts(accounts.map(acc => ({
      ...acc,
      provider: providerSlug,
      price: provider?.price || 400
    })))
  }

  const parseBulkInput = () => {
    const lines = bulkInput.trim().split("\n").filter(line => line.trim())
    const parsed: AccountInput[] = []
    const provider = providers.find(p => p.slug === selectedProvider)
    const commonPassword = bulkPassword.trim()

    if (!commonPassword) {
      toast.error("Please enter a password for all accounts")
      return
    }

    for (const line of lines) {
      const parts = line.split(/[:\t]/)
      if (parts.length >= 1 && parts[0].trim()) {
        parsed.push({
          username: parts[0].trim(),
          password: commonPassword,
          provider: selectedProvider,
          price: provider?.price || 400,
          mobileNumber: parts[1]?.trim() || "",
          email: parts[2]?.trim() || "",
          notes: "",
        })
      }
    }

    if (parsed.length > 0) {
      setAccounts(parsed)
      setMode("single")
      toast.success(`Parsed ${parsed.length} accounts`)
    } else {
      toast.error("No valid accounts found. Enter one username per line")
    }
  }

  const handleSubmit = async () => {
    const valid = accounts.every(acc => acc.username && acc.password)
    if (!valid) {
      toast.error("All accounts must have username and password")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Added ${data.count} accounts successfully!`)
        router.push("/admin/accounts")
      } else {
        toast.error(data.message || "Failed to add accounts")
      }
    } catch (error) {
      toast.error("Error adding accounts")
    } finally {
      setSubmitting(false)
    }
  }

  const currentProvider = providers.find(p => p.slug === selectedProvider)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Add Accounts</h1>
        <p className="text-muted-foreground">Add new accounts to your inventory</p>
      </div>

      {/* Provider Selection */}
      {providers.length > 0 && (
        <div className="card-premium p-4 rounded-xl">
          <label className="text-sm font-medium mb-3 block">Select Provider</label>
          <div className="flex flex-wrap gap-2">
            {providers.map((provider) => (
              <Button
                key={provider._id}
                variant={selectedProvider === provider.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleProviderChange(provider.slug)}
                className={selectedProvider === provider.slug ? "gradient-ocean text-white border-0" : ""}
              >
                {provider.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  ₹{provider.price}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "single" ? "default" : "outline"}
          onClick={() => setMode("single")}
        >
          Manual Entry
        </Button>
        <Button
          variant={mode === "bulk" ? "default" : "outline"}
          onClick={() => setMode("bulk")}
        >
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
      </div>

      {mode === "bulk" ? (
        <div className="card-premium p-6 rounded-xl space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Bulk Import</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a common password for all accounts, then paste one username per line (with optional mobile and email)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Password (for all accounts) *</label>
            <Input
              type="password"
              placeholder="Enter password that all accounts will use"
              value={bulkPassword}
              onChange={(e) => setBulkPassword(e.target.value)}
              className="font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Usernames</label>
            <p className="text-xs text-muted-foreground mb-2">
              Format: <code className="bg-muted px-1 rounded">username</code> (one per line)
              <br />
              Optional: <code className="bg-muted px-1 rounded">username:mobile:email</code>
            </p>
            <textarea
              className="w-full h-48 p-4 border border-border rounded-xl bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="user1&#10;user2:9876543210&#10;user3:9876543211:user@email.com"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
          </div>

          <Button onClick={parseBulkInput}>
            <Check className="w-4 h-4 mr-2" />
            Parse & Preview
          </Button>
        </div>
      ) : (
        <>
          {accounts.map((account, index) => (
            <div key={index} className="card-premium p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Account #{index + 1}</span>
                  <Badge variant="outline" className="capitalize">
                    {currentProvider?.name || selectedProvider}
                  </Badge>
                </div>
                {accounts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAccount(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Username *</label>
                  <Input
                    placeholder="Account username"
                    value={account.username}
                    onChange={(e) => updateAccount(index, "username", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Password *</label>
                  <Input
                    placeholder="Account password"
                    value={account.password}
                    onChange={(e) => updateAccount(index, "password", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Price (₹)</label>
                  <Input
                    type="number"
                    value={account.price}
                    onChange={(e) => updateAccount(index, "price", parseInt(e.target.value) || 400)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Mobile (optional)</label>
                  <Input
                    placeholder="Linked mobile number"
                    value={account.mobileNumber}
                    onChange={(e) => updateAccount(index, "mobileNumber", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Email (optional)</label>
                  <Input
                    placeholder="Linked email address"
                    value={account.email}
                    onChange={(e) => updateAccount(index, "email", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addAccount} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Account
          </Button>
        </>
      )}

      {/* Summary & Submit */}
      <div className="card-premium p-5 rounded-xl bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              Ready to add {accounts.length} account(s)
            </p>
            <p className="text-sm text-muted-foreground">
              Provider: {currentProvider?.name || selectedProvider} • 
              Total value: ₹{accounts.reduce((sum, acc) => sum + acc.price, 0).toLocaleString()}
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={handleSubmit} 
            disabled={submitting}
            className="gradient-ocean text-white border-0"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Add Accounts
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

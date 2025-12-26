"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Package, Plus, Search, Trash2, Eye, EyeOff, 
  Loader2, Filter, Unlock
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface Account {
  _id: string
  username: string
  password: string
  provider: string
  accountType: string
  price: number
  status: string
  mobileNumber?: string
  email?: string
  notes?: string
  createdAt: string
  soldTo?: { name: string; email: string }
  soldAt?: string
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/admin/accounts")
      const data = await res.json()
      if (data.success) {
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return

    try {
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Account deleted")
        fetchAccounts()
      } else {
        toast.error(data.message || "Failed to delete")
      }
    } catch (error) {
      toast.error("Error deleting account")
    }
  }

  const unreserveAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/accounts/${id}/unreserve`, {
        method: "PATCH",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Account unreserved and released back to available")
        fetchAccounts()
      } else {
        toast.error(data.message || "Failed to unreserve")
      }
    } catch (error) {
      toast.error("Error unreserving account")
    }
  }

  const togglePassword = (id: string) => {
    setRevealedPasswords(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.username.toLowerCase().includes(search.toLowerCase()) ||
      acc.email?.toLowerCase().includes(search.toLowerCase()) ||
      acc.provider?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const availableCount = accounts.filter(a => a.status === "available").length
  const soldCount = accounts.filter(a => a.status === "sold").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Accounts</h1>
          <p className="text-muted-foreground">
            {accounts.length} total • {availableCount} available • {soldCount} sold
          </p>
        </div>
        <Link href="/admin/accounts/add">
          <Button className="gradient-ocean text-white border-0 btn-shine">
            <Plus className="w-4 h-4 mr-2" />
            Add Accounts
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, email, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "available", "sold", "reserved"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Accounts List */}
      {loadingAccounts ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="card-premium p-12 rounded-xl text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No accounts found</p>
          <Link href="/admin/accounts/add">
            <Button>Add Your First Account</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAccounts.map((account) => (
            <motion.div
              key={account._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-4 rounded-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{account.username}</p>
                      <Badge 
                        variant={account.status === "available" ? "default" : "secondary"}
                        className={account.status === "available" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                      >
                        {account.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {account.provider || account.accountType || 'irctc'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <span className="text-xs">Password:</span>
                        {revealedPasswords.has(account._id) ? (
                          <span className="font-mono text-foreground">{account.password}</span>
                        ) : (
                          <span>••••••••</span>
                        )}
                        <button 
                          onClick={() => togglePassword(account._id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {revealedPasswords.has(account._id) ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </span>
                      <span className="font-medium text-primary">₹{account.price}</span>
                    </div>
                    {account.soldTo && (
                      <p className="text-xs text-green-500 mt-1">
                        Sold to: {account.soldTo.name} ({account.soldTo.email})
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {account.status === "reserved" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unreserveAccount(account._id)}
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                      title="Release this reserved account back to available"
                    >
                      <Unlock className="w-4 h-4" />
                    </Button>
                  )}
                  {account.status === "available" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAccount(account._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, Search, Loader2, Clock, User, 
  CheckCircle2, XCircle, AlertCircle, Package, Eye, EyeOff, Copy
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface OrderAccount {
  username: string
  password: string
  mobileNumber?: string
  email?: string
}

interface Order {
  _id: string
  orderId: string
  user?: { name: string; email: string } | null
  provider?: { name: string; slug: string }
  accounts?: OrderAccount[]
  accountType: string
  amount: number
  quantity?: number
  status: string
  paymentStatus: string
  customerName?: string
  createdAt: string
  upiTxnId?: string
  transactionId?: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders")
      const data = await res.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const completedCount = orders.filter(o => o.paymentStatus === "completed").length
  const pendingCount = orders.filter(o => o.paymentStatus === "pending").length
  const totalRevenue = orders
    .filter(o => o.paymentStatus === "completed")
    .reduce((sum, o) => sum + o.amount, 0)
  const totalIdsSold = orders
    .filter(o => o.paymentStatus === "completed")
    .reduce((sum, o) => sum + (o.quantity || 1), 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20"
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20"
      default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <p className="text-muted-foreground">
          {orders.length} total orders • {completedCount} completed • {totalIdsSold} IDs sold • ₹{totalRevenue.toLocaleString()} revenue
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold mt-1 text-green-500">{completedCount}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold mt-1 text-yellow-500">{pendingCount}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">IDs Sold</p>
          <p className="text-2xl font-bold mt-1 text-blue-500">{totalIdsSold}</p>
        </div>
        <div className="card-premium p-4 rounded-xl bg-gradient-to-br from-primary to-primary/80">
          <p className="text-sm text-white/70">Revenue</p>
          <p className="text-2xl font-bold mt-1 text-white">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "completed", "pending", "failed"].map((status) => (
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

      {/* Orders List */}
      {loadingOrders ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card-premium p-12 rounded-xl text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {getStatusIcon(order.paymentStatus)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold font-mono text-sm">#{order.orderId}</p>
                        <Badge className={getStatusStyle(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                        {(order.quantity || 1) > 1 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {order.quantity} IDs
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {order.user?.name || order.customerName || "Guest"}
                        </span>
                        <span className="hidden sm:inline">
                          {order.user?.email || "Anonymous Purchase"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{order.amount}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>

              {/* Expandable Credentials Section */}
              {expandedOrder === order._id && order.paymentStatus === "completed" && order.accounts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border bg-muted/30 p-4 space-y-3"
                >
                  {order.upiTxnId && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Transaction ID</p>
                      <div className="flex items-center gap-2 bg-background rounded-lg p-2 font-mono text-sm">
                        <span className="flex-1 truncate">{order.upiTxnId}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(order.upiTxnId || "")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.accounts.map((account, idx) => (
                    <div key={idx} className="bg-background rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Account #{idx + 1}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Username</p>
                          <div className="flex items-center gap-2 bg-muted rounded px-2 py-1 font-mono">
                            <span className="flex-1 truncate">{account.username}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => copyToClipboard(account.username)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Password</p>
                          <div className="flex items-center gap-2 bg-muted rounded px-2 py-1 font-mono">
                            <span className="flex-1 truncate">
                              {revealedPasswords.has(`${order._id}-${idx}`) ? account.password : "••••••"}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => togglePassword(`${order._id}-${idx}`)}
                            >
                              {revealedPasswords.has(`${order._id}-${idx}`) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {account.mobileNumber && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Mobile:</span> {account.mobileNumber}
                        </div>
                      )}
                      {account.email && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Email:</span> {account.email}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

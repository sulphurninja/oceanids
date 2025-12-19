"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Package, Clock, CheckCircle2, XCircle, AlertCircle,
  Eye, EyeOff, Copy, Loader2, Search, ShoppingBag,
  Calendar, CreditCard, ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Order {
  _id: string
  orderId: string
  provider?: { name: string; slug: string }
  accountType?: string
  amount: number
  status: string
  paymentStatus: string
  createdAt: string
  account?: {
    username: string
    password: string
  }
  credentialsRevealed: boolean
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [revealedOrders, setRevealedOrders] = useState<Set<string>>(new Set())
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const toggleCredentials = (orderId: string) => {
    setRevealedOrders(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "failed": return <XCircle className="w-5 h-5 text-red-500" />
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />
      default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(search.toLowerCase()) ||
    (order.provider?.name || order.accountType || '').toLowerCase().includes(search.toLowerCase())
  )

  const completedOrders = orders.filter(o => o.paymentStatus === "completed").length
  const totalSpent = orders
    .filter(o => o.paymentStatus === "completed")
    .reduce((sum, o) => sum + o.amount, 0)

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
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Orders</h1>
        <p className="text-muted-foreground">View and manage your purchases</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedOrders}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedOrders}</p>
              <p className="text-sm text-muted-foreground">Accounts</p>
            </div>
          </div>
        </div>
        <div className="card-premium p-4 rounded-xl bg-gradient-to-br from-primary to-primary/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">₹{totalSpent}</p>
              <p className="text-sm text-white/70">Total Spent</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div variants={item}>
          <div className="card-premium p-12 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search 
                ? "No orders match your search" 
                : "Purchase your first account to see your orders here"
              }
            </p>
            {!search && (
              <Link href="/dashboard/purchase">
                <Button className="gradient-ocean text-white border-0 btn-shine">
                  Browse Accounts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-4">
          {filteredOrders.map((order, index) => {
            const isRevealed = revealedOrders.has(order._id)
            const isExpanded = expandedOrder === order._id
            const isCompleted = order.paymentStatus === "completed"

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium rounded-xl overflow-hidden"
              >
                {/* Order Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {getStatusIcon(order.paymentStatus)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">#{order.orderId}</p>
                          {getStatusBadge(order.paymentStatus)}
                          <Badge variant="outline" className="capitalize">
                            {order.provider?.name || order.accountType || 'IRCTC'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{order.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {isExpanded ? 'Click to collapse' : 'Click for details'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-4">
                        {/* Credentials Section */}
                        {isCompleted && order.account ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                Account Credentials
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleCredentials(order._id)
                                }}
                              >
                                {isRevealed ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Show
                                  </>
                                )}
                              </Button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              {/* Username */}
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Username</p>
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-mono font-medium">
                                    {isRevealed ? order.account.username : '••••••••••'}
                                  </p>
                                  {isRevealed && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        copyToClipboard(order.account!.username, 'Username')
                                      }}
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Password */}
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Password</p>
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-mono font-medium">
                                    {isRevealed ? order.account.password : '••••••••••'}
                                  </p>
                                  {isRevealed && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        copyToClipboard(order.account!.password, 'Password')
                                      }}
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isRevealed && (
                              <p className="text-xs text-muted-foreground">
                                ⚠️ Keep your credentials safe. Do not share them with anyone.
                              </p>
                            )}
                          </div>
                        ) : isCompleted ? (
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-sm text-green-500">
                              ✓ Payment successful! Your account details will appear here shortly.
                            </p>
                          </div>
                        ) : order.paymentStatus === "pending" ? (
                          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-sm text-yellow-600">
                              ⏳ Payment pending. Complete your payment to receive account credentials.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-500">
                              ✗ Payment failed. Please try again or contact support.
                            </p>
                          </div>
                        )}

                        {/* Order Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Order ID</p>
                            <p className="font-mono text-sm">{order.orderId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Provider</p>
                            <p className="text-sm capitalize">{order.provider?.name || order.accountType || 'IRCTC'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="text-sm font-semibold">₹{order.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="text-sm capitalize">{order.paymentStatus}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}



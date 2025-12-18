"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, Package, Clock, CheckCircle, 
  Eye, EyeOff, Copy, ArrowRight, Sparkles,
  TrendingUp, Receipt
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { motion } from "framer-motion"

interface Order {
  _id: string
  orderId: string
  provider?: { name: string; slug: string } | string
  amount: number
  status: string
  paymentStatus: string
  credentialsRevealed: boolean
  account?: {
    username: string
    password: string
    mobileNumber?: string
    email?: string
  }
  createdAt: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [revealedOrders, setRevealedOrders] = useState<Set<string>>(new Set())

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
    } finally {
      setLoadingOrders(false)
    }
  }

  const toggleReveal = (orderId: string) => {
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

  const completedOrders = orders.filter(o => o.paymentStatus === "completed")
  const pendingOrders = orders.filter(o => o.paymentStatus !== "completed")

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-muted-foreground">Here's what's happening with your accounts.</p>
          </div>
          <Link href="/dashboard/purchase">
            <Button className="gradient-ocean text-white border-0 btn-shine">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Buy Account
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="card-premium p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedOrders.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

        <div className="card-premium p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingOrders.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="card-premium p-5 rounded-xl gradient-ocean">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                ₹{orders.reduce((acc, o) => acc + (o.paymentStatus === "completed" ? o.amount : 0), 0)}
              </p>
              <p className="text-sm text-white/70">Total Spent</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Card */}
      {orders.length === 0 && (
        <motion.div variants={item}>
          <div className="card-premium card-glow p-8 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Your First User ID</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Purchase your first verified account and start booking tickets instantly.
            </p>
            <Link href="/dashboard/purchase">
              <Button size="lg" className="gradient-ocean text-white border-0 btn-shine">
                Browse Accounts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recent Orders */}
      {orders.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium card-hover p-4 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {typeof order.provider === 'object' ? order.provider?.name : order.provider || 'IRCTC'} Account
                      </p>
                      <p className="text-xs text-muted-foreground">Order #{order.orderId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.amount}</p>
                    <Badge
                      variant={order.paymentStatus === "completed" ? "default" : "secondary"}
                      className={order.paymentStatus === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {order.paymentStatus === "completed" && order.account && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Credentials</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReveal(order._id)}
                        className="h-8 px-2"
                      >
                        {revealedOrders.has(order._id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    {revealedOrders.has(order._id) ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div>
                            <span className="text-xs text-muted-foreground">Username</span>
                            <p className="font-mono text-sm">{order.account.username}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.account!.username, "Username")}
                            className="h-8 px-2"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div>
                            <span className="text-xs text-muted-foreground">Password</span>
                            <p className="font-mono text-sm">{order.account.password}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.account!.password, "Password")}
                            className="h-8 px-2"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click the eye icon to reveal your credentials
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

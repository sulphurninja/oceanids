"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { 
  Package, Users, ShoppingCart, TrendingUp,
  Loader2, ArrowRight, Plus
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Stats {
  totalAccounts: number
  availableAccounts: number
  soldAccounts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  stockByType: Record<string, { available: number; sold: number }>
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const quickActions = [
    {
      href: "/admin/accounts",
      icon: Package,
      title: "Manage Stock",
      description: "View and manage all accounts",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      href: "/admin/accounts/add",
      icon: Plus,
      title: "Add Accounts",
      description: "Add new accounts to inventory",
      color: "bg-green-500/10 text-green-500",
    },
    {
      href: "/admin/orders",
      icon: ShoppingCart,
      title: "View Orders",
      description: "Track all customer orders",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      href: "/admin/users",
      icon: Users,
      title: "Manage Users",
      description: "View and manage customers",
      color: "bg-orange-500/10 text-orange-500",
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="text-foreground font-medium">{user?.name}</span>
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.availableAccounts || 0}
              </p>
              <p className="text-sm text-muted-foreground">In Stock</p>
            </div>
          </div>
        </div>

        <div className="card-premium p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalOrders || 0}
              </p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
          </div>
        </div>

        <div className="card-premium p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalUsers || 0}
              </p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
          </div>
        </div>

        <div className="card-premium p-5 rounded-xl bg-gradient-to-br from-primary to-primary/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
              </p>
              <p className="text-sm text-white/70">Revenue</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stock by Provider */}
      {stats && Object.keys(stats.stockByType).length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold mb-4">Stock by Type</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.stockByType).map(([type, data]) => (
              <div key={type} className="card-premium p-4 rounded-xl">
                <p className="text-sm text-muted-foreground capitalize mb-3">{type}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-500">{data.available}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-500">{data.sold}</p>
                    <p className="text-xs text-muted-foreground">Sold</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="card-premium card-hover p-5 rounded-xl group cursor-pointer h-full">
                <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Placeholder */}
      <motion.div variants={item}>
        <div className="card-premium p-6 rounded-xl">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Activity feed coming soon</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

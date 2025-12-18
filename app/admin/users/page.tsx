"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Search, Loader2, Mail, Shield, Calendar, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface UserData {
  _id: string
  name: string
  email: string
  phone: string
  isAdmin: boolean
  createdAt: string
  orderCount: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchUsers()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Error updating user")
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = 
      roleFilter === "all" || 
      (roleFilter === "admin" && u.isAdmin) ||
      (roleFilter === "user" && !u.isAdmin)
    return matchesSearch && matchesRole
  })

  const adminCount = users.filter(u => u.isAdmin).length
  const totalOrders = users.reduce((sum, u) => sum + u.orderCount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          {users.length} registered users • {adminCount} admins • {totalOrders} total orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold mt-1 text-primary">{adminCount}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Customers</p>
          <p className="text-2xl font-bold mt-1">{users.length - adminCount}</p>
        </div>
        <div className="card-premium p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold mt-1 text-green-500">{totalOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "admin", "user"].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
              className="capitalize"
            >
              {role === "user" ? "Customers" : role}
            </Button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {loadingUsers ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card-premium p-12 rounded-xl text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((userData) => (
            <motion.div
              key={userData._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-4 rounded-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    userData.isAdmin 
                      ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                      : 'bg-gradient-to-br from-primary to-primary/80'
                  }`}>
                    <span className="text-white font-semibold">
                      {userData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{userData.name}</p>
                      {userData.isAdmin && (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {userData.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-3">
                    <div className="flex items-center gap-1 text-lg font-bold">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      {userData.orderCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <Button
                    variant={userData.isAdmin ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => toggleAdmin(userData._id, userData.isAdmin)}
                  >
                    {userData.isAdmin ? "Remove Admin" : "Make Admin"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

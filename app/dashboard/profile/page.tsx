"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  User, Mail, Phone, Calendar, Shield, 
  Edit2, Save, X, Loader2, CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: (user as any)?.phone || "",
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // API call to update profile would go here
      toast.success("Profile updated successfully!")
      setEditing(false)
      refreshUser()
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
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
      className="max-w-2xl space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={item}>
        <div className="card-premium p-6 rounded-2xl">
          {/* Avatar & Name */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-20 h-20 rounded-2xl gradient-ocean flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                {user?.isAdmin && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span>Verified Account</span>
              </div>
            </div>
            <Button
              variant={editing ? "ghost" : "outline"}
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Full Name</label>
                {editing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{user?.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Email Address</label>
                <p className="font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Email cannot be changed</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Phone Number</label>
                {editing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{(user as any)?.phone || "Not provided"}</p>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Member Since</label>
                <p className="font-medium">
                  {(user as any)?.createdAt 
                    ? new Date((user as any).createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {editing && (
            <div className="mt-6 pt-6 border-t border-border">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="gradient-ocean text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Account Stats */}
      <motion.div variants={item}>
        <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="card-premium p-4 rounded-xl">
            <p className="text-2xl font-bold gradient-text">0</p>
            <p className="text-sm text-muted-foreground">Accounts Purchased</p>
          </div>
          <div className="card-premium p-4 rounded-xl">
            <p className="text-2xl font-bold gradient-text">₹0</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}


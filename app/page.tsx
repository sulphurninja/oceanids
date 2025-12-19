"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Train, Shield, Zap, Clock, CheckCircle, Download, Copy, Loader2, 
  AlertCircle, Package, MessageCircle, ChevronDown, Sparkles,
  Flame, Timer, BadgeCheck, ArrowRight, Gift, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface PurchasedAccount {
  username: string
  password: string
  mobileNumber?: string
  email?: string
}

type PurchaseStatus = "idle" | "processing" | "success" | "failed"

const faqs = [
  { q: "Ye ID kitni der mein milegi?", a: "Bhai payment hote hi INSTANT milegi! Koi wait nahi, seedha screen pe credentials aa jayenge." },
  { q: "Kya ye verified hai?", a: "100% VERIFIED hai bhai! Fresh IDs hai, direct use kar sakte ho booking ke liye." },
  { q: "Payment kaise hoga?", a: "UPI se - GPay, PhonePe, Paytm, BHIM - jo bhi use karo, sab chalega!" },
  { q: "Agar koi problem aaye?", a: "WhatsApp pe message karo, 24/7 available hai hum. Instant help milegi!" }
]

export default function HomePage() {
  const [stock, setStock] = useState<number>(0)
  const [pricePerID, setPricePerID] = useState<number>(199)
  const [loading, setLoading] = useState(true)
  const [selectedQty, setSelectedQty] = useState<number>(1)
  const [customQty, setCustomQty] = useState<string>("")
  const [isCustom, setIsCustom] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>("idle")
  const [purchasedAccounts, setPurchasedAccounts] = useState<PurchasedAccount[]>([])
  const [orderId, setOrderId] = useState<string>("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const whatsappNumber = "919999999999"

  useEffect(() => { fetchStock() }, [])

  const fetchStock = async () => {
    try {
      const res = await fetch("/api/stock")
      const data = await res.json()
      if (data.success) {
        setStock(data.stock)
        if (data.pricePerID) setPricePerID(data.pricePerID)
      }
    } catch (error) { console.error("Failed to fetch stock:", error) }
    finally { setLoading(false) }
  }

  const quantity = isCustom ? (parseInt(customQty) || 0) : selectedQty
  const totalPrice = quantity * pricePerID

  const presetQtys = [
    { qty: 1, label: "1 ID", popular: false },
    { qty: 2, label: "2 IDs", popular: false },
    { qty: 5, label: "5 IDs", popular: true },
    { qty: 10, label: "10 IDs", popular: false },
  ]

  const handleSelectQty = (qty: number) => { setSelectedQty(qty); setIsCustom(false); setCustomQty("") }
  const handleCustomQty = (value: string) => { setCustomQty(value); setIsCustom(true) }

  const handlePurchase = async () => {
    if (quantity <= 0) { toast.error("Quantity select karo bhai!"); return }
    if (quantity > stock) { toast.error("Itna stock nahi hai abhi!"); return }
    setPurchaseStatus("processing")
    try {
      const res = await fetch("/api/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) })
      const data = await res.json()
      if (data.success && data.paymentUrl) { window.location.href = data.paymentUrl }
      else { toast.error(data.message || "Kuch gadbad ho gayi!"); setPurchaseStatus("idle") }
    } catch (error) { toast.error("Kuch gadbad ho gayi!"); setPurchaseStatus("idle") }
  }

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copy ho gaya!") }
  const copyAllCredentials = () => {
    const text = purchasedAccounts.map((acc, i) => `ID ${i + 1}: ${acc.username} | ${acc.password}`).join("\n")
    navigator.clipboard.writeText(text); toast.success("Sab copy ho gaya!")
  }
  const downloadCSV = () => {
    const headers = ["Sr", "Username", "Password", "Mobile", "Email"]
    const rows = purchasedAccounts.map((acc, i) => [i + 1, acc.username, acc.password, acc.mobileNumber || "", acc.email || ""])
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `irctc_ids_${orderId || Date.now()}.csv`; a.click()
    window.URL.revokeObjectURL(url); toast.success("CSV download ho gaya!")
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentOrderId = urlParams.get("order_id"), status = urlParams.get("status")
    if (paymentOrderId && status === "success") { setOrderId(paymentOrderId); setPurchaseStatus("processing"); checkPaymentAndGetCredentials(paymentOrderId) }
    else if (status === "failed") { setPurchaseStatus("failed"); toast.error("Payment fail ho gaya!"); window.history.replaceState({}, "", "/") }
  }, [])

  const checkPaymentAndGetCredentials = async (oid: string) => {
    try {
      const res = await fetch(`/api/purchase/verify?order_id=${oid}`); const data = await res.json()
      if (data.success && data.accounts) { setPurchasedAccounts(data.accounts); setPurchaseStatus("success"); fetchStock(); window.history.replaceState({}, "", "/") }
      else if (data.pending) { setTimeout(() => checkPaymentAndGetCredentials(oid), 2000) }
      else { setPurchaseStatus("failed"); toast.error(data.message || "Verification fail!"); window.history.replaceState({}, "", "/") }
    } catch (error) { setPurchaseStatus("failed"); toast.error("Verification fail!"); window.history.replaceState({}, "", "/") }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-600/20 via-fuchsia-600/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/15 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-orange-600/10 to-transparent blur-3xl" />
      </div>

      {/* WhatsApp Button */}
      <a href={`https://wa.me/${whatsappNumber}?text=Bhai IRCTC ID chahiye!`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 hover:scale-110 transition-all group">
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-white text-gray-900 px-3 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Help chahiye? 💬
        </span>
      </a>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight">OceanIDs</h1>
                <p className="text-[10px] text-white/50 -mt-0.5">IRCTC ID Provider #1</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="hidden sm:flex items-center gap-1.5 text-sm text-white/60 hover:text-green-400 transition-colors">
                <MessageCircle className="w-4 h-4" /> Support
              </a>
              <a href="/admin" className="text-xs text-white/30 hover:text-white/60">Admin</a>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 pt-8 md:pt-16 pb-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 px-4 py-2 rounded-full mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-bold text-sm">
                {loading ? "Loading..." : stock > 0 ? `🔥 ${stock} IDs LIVE hai abhi!` : "Out of Stock"}
              </span>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              Fresh IRCTC ID <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                Instant Delivery! ⚡
              </span>
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-8">
              Payment karo, <span className="text-cyan-400 font-semibold">2 second</span> mein ID haath mein! 
              <br className="hidden md:block" />
              100% Verified • Tatkal Ready • Instant Access
            </motion.p>

            {/* Trust Pills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                { icon: BadgeCheck, text: "Verified IDs", color: "text-green-400" },
                { icon: Zap, text: "Instant Delivery", color: "text-yellow-400" },
                { icon: Shield, text: "Safe Payment", color: "text-blue-400" },
                { icon: TrendingUp, text: "10K+ Sold", color: "text-pink-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/5 backdrop-blur px-3 py-1.5 rounded-full text-sm">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-white/80">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Card */}
        <section className="max-w-md mx-auto px-4 pb-16">
          <AnimatePresence mode="wait">
            {purchaseStatus === "success" && purchasedAccounts.length > 0 ? (
              /* SUCCESS */
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-gradient-to-b from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-6 backdrop-blur-xl">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-black text-green-400 mb-1">Payment Successful! 🎉</h2>
                  <p className="text-white/60">Ye lo tumhari {purchasedAccounts.length} ID{purchasedAccounts.length > 1 ? "s" : ""}</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <Button onClick={copyAllCredentials} variant="outline" className="flex-1 h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                    <Copy className="w-4 h-4 mr-2" /> Copy All
                  </Button>
                  <Button onClick={downloadCSV} className="flex-1 h-11 bg-green-500 hover:bg-green-400 text-black font-bold">
                    <Download className="w-4 h-4 mr-2" /> CSV Download
                  </Button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {purchasedAccounts.map((acc, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                      className="bg-black/40 border border-white/10 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">ID #{idx + 1}</span>
                        <button onClick={() => copyToClipboard(`${acc.username}:${acc.password}`)} className="text-white/40 hover:text-white">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><p className="text-white/40 text-[10px] uppercase mb-0.5">Username</p><p className="font-mono font-bold">{acc.username}</p></div>
                        <div><p className="text-white/40 text-[10px] uppercase mb-0.5">Password</p><p className="font-mono font-bold">{acc.password}</p></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button onClick={() => { setPurchaseStatus("idle"); setPurchasedAccounts([]); setOrderId("") }}
                  className="w-full mt-4 text-white/50 hover:text-white text-sm py-2 transition-colors">
                  ← Aur IDs kharidni hai?
                </button>
              </motion.div>
            ) : (
              /* PURCHASE FORM */
              <motion.div key="purchase" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                
                {/* Limited Stock Alert */}
                {stock > 0 && stock <= 20 && (
                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/20 px-4 py-2.5 flex items-center justify-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="text-orange-300 text-sm font-semibold">Sirf {stock} IDs bachi hai! Jaldi karo!</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-bold">Kitni ID chahiye? 🤔</h3>
                      <p className="text-white/50 text-sm">Select karo aur pay karo</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      stock > 10 ? "bg-green-500/20 text-green-400 border border-green-500/30" : 
                      stock > 0 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : 
                      "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}>
                      <Package className="w-3.5 h-3.5" />
                      {loading ? "..." : stock > 0 ? `${stock} left` : "Sold out!"}
                    </div>
                  </div>

                  {/* Quantity Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    {presetQtys.map((item) => (
                      <button key={item.qty} onClick={() => handleSelectQty(item.qty)}
                        disabled={item.qty > stock || purchaseStatus === "processing"}
                        className={`relative p-4 rounded-2xl transition-all ${
                          !isCustom && selectedQty === item.qty
                            ? "bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border-2 border-violet-400 shadow-lg shadow-violet-500/20"
                            : "bg-white/5 border-2 border-transparent hover:border-white/20"
                        } ${item.qty > stock ? "opacity-40 cursor-not-allowed" : ""}`}>
                        {item.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                            POPULAR 🔥
                          </span>
                        )}
                        <div className="text-xl font-black">{item.label}</div>
                        <div className="text-violet-400 font-bold">₹{item.qty * pricePerID}</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom */}
                  <div onClick={() => setIsCustom(true)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer mb-5 ${
                      isCustom ? "bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border-2 border-violet-400" : "bg-white/5 border-2 border-transparent hover:border-white/20"
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white/80">Custom:</span>
                      <Input type="number" placeholder="Qty" value={customQty} onChange={(e) => handleCustomQty(e.target.value)}
                        min={1} max={stock} className="w-20 h-10 text-center bg-black/40 border-white/20 text-white font-bold" disabled={purchaseStatus === "processing"} />
                      {isCustom && parseInt(customQty) > 0 && (
                        <span className="text-violet-400 font-bold ml-auto text-lg">₹{parseInt(customQty) * pricePerID}</span>
                      )}
                    </div>
                  </div>

                  {/* Total & Pay */}
                  {quantity > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 mb-4">
                        <span className="text-white/60 font-medium">Total Amount:</span>
                        <div className="text-right">
                          <span className="text-3xl font-black text-white">₹{totalPrice}</span>
                          <p className="text-[10px] text-white/40">{quantity} ID × ₹{pricePerID}</p>
                        </div>
                      </div>

                      <Button onClick={handlePurchase} disabled={purchaseStatus === "processing" || stock === 0 || quantity > stock}
                        className="w-full h-14 text-lg font-black bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-400 hover:via-fuchsia-400 hover:to-pink-400 shadow-xl shadow-fuchsia-500/30 transition-all hover:shadow-2xl hover:shadow-fuchsia-500/40 rounded-2xl">
                        {purchaseStatus === "processing" ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                        ) : (
                          <><Sparkles className="w-5 h-5 mr-2" /> Pay ₹{totalPrice} via UPI 💳</>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/30">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 24/7</span>
                      </div>
                    </motion.div>
                  )}

                  {purchaseStatus === "failed" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <div>
                        <p className="font-bold text-red-400 text-sm">Payment Fail Ho Gaya! 😢</p>
                        <p className="text-xs text-red-400/70">Dobara try karo ya support se baat karo</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price Banner */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full">
              <Gift className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-semibold">Sirf ₹{pricePerID}/ID • No Hidden Charges!</span>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-3xl font-black text-center mb-3">Kaise Kaam Karta Hai? 🤷</h3>
            <p className="text-white/50 text-center mb-10">Sirf 3 simple steps!</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", icon: "🛒", title: "Quantity Select Karo", desc: "Jitni ID chahiye wo choose karo", color: "from-blue-500 to-cyan-500" },
                { step: "2", icon: "💳", title: "UPI se Pay Karo", desc: "GPay, PhonePe, Paytm - koi bhi", color: "from-green-500 to-emerald-500" },
                { step: "3", icon: "🎉", title: "Instant ID Lo!", desc: "2 second mein credentials haath mein", color: "from-orange-500 to-red-500" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all group">
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-sm font-black`}>
                    {item.step}
                  </div>
                  <div className="text-4xl mb-3 mt-2">{item.icon}</div>
                  <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { value: "10,000+", label: "IDs Sold", emoji: "🎯" },
                  { value: "4.9/5", label: "Rating", emoji: "⭐" },
                  { value: "2 sec", label: "Delivery", emoji: "⚡" },
                  { value: "24/7", label: "Support", emoji: "💬" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                    <div className="text-white/50 text-sm">{stat.emoji} {stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4">
            <h3 className="text-3xl font-black text-center mb-3">Sawaal Hai? 🙋</h3>
            <p className="text-white/50 text-center mb-8">Yahan dekho shayad answer mil jaye</p>
            
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                    <span className="font-semibold">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <p className="px-4 pb-4 text-white/60">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h3 className="text-3xl md:text-4xl font-black mb-4">Ready Ho? 🚀</h3>
            <p className="text-white/50 text-lg mb-6">Scroll up karo aur abhi apni ID lo!</p>
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 rounded-2xl">
              <ArrowRight className="w-5 h-5 mr-2" /> Abhi ID Lo
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/40 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Train className="w-4 h-4" />
                </div>
                <span className="font-bold">OceanIDs</span>
                <span className="text-white/30 text-sm">• India's #1 IRCTC ID Provider</span>
              </div>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 px-4 py-2 rounded-full text-sm font-bold transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp Support
              </a>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/30">
              <p>© {new Date().getFullYear()} OceanIDs. All rights reserved.</p>
              <p className="mt-1">Independent service. Not affiliated with IRCTC.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

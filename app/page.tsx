"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Waves, Shield, Zap, Clock, CheckCircle, Download, Copy, Loader2,
  AlertCircle, Package, MessageCircle, ChevronDown, Sparkles, TrendingUp,
  Star, Headphones, ArrowRight, Check, Users, Award, Timer, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface PurchasedAccount {
  username: string
  password: string
  mobileNumber?: string
  email?: string
  emailPassword?: string
}

type PurchaseStatus = "idle" | "processing" | "success" | "failed"

const faqs = [
  { q: "How fast will I get the IDs?", a: "Instantly. Within 2-3 seconds of payment confirmation, your credentials will be on screen." },
  { q: "Are these accounts verified?", a: "100% verified and fresh. All accounts are tested and ready for IRCTC bookings." },
  { q: "What payment methods do you accept?", a: "UPI only. Google Pay, PhonePe, Paytm, BHIM - any UPI app works perfectly." },
  { q: "What if something goes wrong?", a: "Hit us up on WhatsApp. Available 24/7 with instant support." }
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
  const [lookupMode, setLookupMode] = useState(false)
  const [lookupTxnId, setLookupTxnId] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState<string>("")

  const whatsappNumber = "918004277632"

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
    if (quantity <= 0) { toast.error("Select a quantity!"); return }
    if (quantity > stock) { toast.error("Not enough stock available."); return }
    setPurchaseStatus("processing")
    try {
      const res = await fetch("/api/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) })
      const data = await res.json()
      if (data.success && data.paymentUrl) {
        setPendingOrderId(data.orderId)
        window.location.href = data.paymentUrl
      }
      else { toast.error(data.message || "Something went wrong."); setPurchaseStatus("idle") }
    } catch (error) { toast.error("Something went wrong."); setPurchaseStatus("idle") }
  }

  const handleLookupTransaction = async () => {
    if (!lookupTxnId.trim()) {
      toast.error("Please enter a transaction ID")
      return
    }

    setLookupLoading(true)
    try {
      const res = await fetch(`/api/purchase/verify?order_id=${encodeURIComponent(lookupTxnId)}`)
      const data = await res.json()

      if (data.success && data.accounts) {
        setPurchasedAccounts(data.accounts)
        setOrderId(lookupTxnId)
        setPurchaseStatus("success")
        setLookupMode(false)
        toast.success("IDs found!")
      } else {
        toast.error(data.message || "Transaction not found")
      }
    } catch (error) {
      toast.error("Error looking up transaction")
    } finally {
      setLookupLoading(false)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingOrderId && purchaseStatus === "processing") {
        navigator.sendBeacon(
          `/api/purchase/cancel?order_id=${encodeURIComponent(pendingOrderId)}`,
          JSON.stringify({ orderId: pendingOrderId })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pendingOrderId, purchaseStatus])

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!") }
  const copyAllCredentials = () => {
    const text = purchasedAccounts.map((acc, i) => `ID ${i + 1}: ${acc.username} | ${acc.password}`).join("\n")
    navigator.clipboard.writeText(text); toast.success("All copied!")
  }
  const downloadCSV = () => {
    const headers = ["Sr", "Username", "Password", "Mobile", "Email", "Email Password"]
    const rows = purchasedAccounts.map((acc, i) => [i + 1, acc.username, acc.password, acc.mobileNumber || "", acc.email || "", acc.emailPassword || ""])
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `irctc_ids_${orderId || Date.now()}.csv`; a.click()
    window.URL.revokeObjectURL(url); toast.success("Downloaded!")
  }

  useEffect(() => {
    let urlString = window.location.href
    if (urlString.includes('#')) {
      urlString = urlString.split('#')[0]
    }

    const firstQuestionMark = urlString.indexOf('?')
    if (firstQuestionMark !== -1) {
      const beforeQuery = urlString.substring(0, firstQuestionMark + 1)
      const afterQuery = urlString.substring(firstQuestionMark + 1).replace(/\?/g, '&')
      urlString = beforeQuery + afterQuery
    }

    const url = new URL(urlString)
    const urlParams = url.searchParams
    let paymentOrderId = urlParams.get("order_id") || urlParams.get("client_txn_id")

    if (paymentOrderId) {
      paymentOrderId = paymentOrderId.split('#')[0].trim()
    }

    if (paymentOrderId) {
      setOrderId(paymentOrderId)
      setPurchaseStatus("processing")
      checkPaymentAndGetCredentials(paymentOrderId)
    }
  }, [])

  const checkPaymentAndGetCredentials = async (oid: string) => {
    try {
      console.log('[VERIFY] Checking payment status for order:', oid);

      const res = await fetch(`/api/purchase/verify?order_id=${encodeURIComponent(oid)}`)
      const data = await res.json()

      console.log('[VERIFY] Payment verification response:', data);

      if (data.success && data.accounts) {
        setPurchasedAccounts(data.accounts)
        setPurchaseStatus("success")
        fetchStock()
        window.history.replaceState({}, "", "/")
        return
      }
      else if (data.pending) {
        setTimeout(() => checkPaymentAndGetCredentials(oid), 2000)
        return
      }
      else {
        setPurchaseStatus("failed")
        toast.error(data.message || "Verification failed.")
      }
    } catch (error) {
      console.error('[VERIFY] Error checking payment:', error)
      toast.error("Error verifying payment.")
      setPurchaseStatus("failed")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden relative">
      {/* Vibrant Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-b from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* WhatsApp Button */}
      <a href={`https://wa.me/${whatsappNumber}?text=Need IRCTC IDs`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-emerald-500/30">
        <MessageCircle className="w-6 h-6 text-white" />
      </a>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white tracking-tight">OceanIDs</h1>
                <p className="text-[11px] text-cyan-400 font-medium tracking-wide">Premium IRCTC Accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="hidden sm:flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10">
                <Headphones className="w-4 h-4" /> Support
              </a>
              <a href="/admin" className="text-xs text-white/40 hover:text-white/70 font-medium transition-colors">Admin</a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-start">
            {/* Left Column: Purchase Form */}
            <div className="lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
                {purchaseStatus === "success" && purchasedAccounts.length > 0 ? (
                  /* SUCCESS STATE */
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/30 border-2 border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-white mb-1">Order Complete!</h2>
                      <p className="text-emerald-300 font-medium">{purchasedAccounts.length} {purchasedAccounts.length > 1 ? "accounts" : "account"} delivered</p>
                    </div>

                    {/* Transaction ID */}
                    {orderId && (
                      <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-4">
                        <p className="text-xs text-white/50 font-semibold mb-1.5 uppercase tracking-wider">Transaction ID</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-cyan-300 flex-1 truncate">{orderId}</p>
                          <button onClick={() => copyToClipboard(orderId)} className="text-white/40 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mb-5">
                      <Button onClick={copyAllCredentials} className="flex-1 h-12 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all shadow-lg">
                        <Copy className="w-4 h-4 mr-2" /> Copy All
                      </Button>
                      <Button onClick={downloadCSV} className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {purchasedAccounts.map((acc, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08, duration: 0.3 }}
                          className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/20">Account {idx + 1}</span>
                            <button onClick={() => copyToClipboard(`${acc.username}:${acc.password}${acc.email ? ':' + acc.email : ''}${acc.emailPassword ? ':' + acc.emailPassword : ''}`)} className="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><p className="text-white/50 mb-1 font-medium text-xs">Username</p><p className="font-mono text-cyan-300 break-all">{acc.username}</p></div>
                            <div><p className="text-white/50 mb-1 font-medium text-xs">Password</p><p className="font-mono text-cyan-300 break-all">{acc.password}</p></div>
                            {acc.email && (
                              <div><p className="text-white/50 mb-1 font-medium text-xs">Email</p><p className="font-mono text-cyan-300 break-all">{acc.email}</p></div>
                            )}
                            {acc.emailPassword && (
                              <div><p className="text-white/50 mb-1 font-medium text-xs">Email Password</p><p className="font-mono text-cyan-300 break-all">{acc.emailPassword}</p></div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button onClick={() => { setPurchaseStatus("idle"); setPurchasedAccounts([]); setOrderId("") }}
                      className="w-full mt-5 text-white/60 hover:text-white text-sm py-3 transition-colors font-semibold flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10">
                      <ArrowRight className="w-4 h-4 rotate-180" /> Purchase More IDs
                    </button>
                  </motion.div>
                ) : (
                  /* PURCHASE FORM */
                  <motion.div key="purchase" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">

                    {/* Stock Status */}
                    {stock > 0 && (
                      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"></div>
                          <span className="text-sm font-bold text-white">{stock} IDs Available</span>
                        </div>
                        {stock <= 20 && (
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      {/* Header */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Select Quantity</h3>
                        <p className="text-sm text-white/60">₹{pricePerID} per account • Instant delivery • 100% verified</p>
                      </div>

                      {/* PROMINENT Transaction Lookup Button */}
                      {!lookupMode && (
                        <motion.button
                          onClick={() => setLookupMode(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mb-5 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-2 border-amber-500/40 hover:border-amber-400/60 rounded-xl transition-all flex items-center justify-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/40 transition-colors">
                            <Search className="w-5 h-5 text-amber-300" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-amber-200 text-sm">Find ID</p>
                            <p className="text-amber-300/70 text-xs">Lookup your order with Transaction ID</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-amber-300/70 ml-auto group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      )}

                      {lookupMode ? (
                        /* LOOKUP MODE */
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Search className="w-5 h-5 text-amber-400" />
                            <h4 className="font-bold text-amber-200">Find Your Order</h4>
                          </div>
                          <Input
                            placeholder="Enter your transaction ID..."
                            value={lookupTxnId}
                            onChange={(e) => setLookupTxnId(e.target.value)}
                            className="font-mono text-sm bg-black/30 border-amber-500/30 text-white placeholder:text-white/40 h-12 text-base"
                          />
                          <div className="flex gap-3">
                            <Button
                              onClick={handleLookupTransaction}
                              disabled={lookupLoading}
                              className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/30"
                            >
                              {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Find My IDs <ArrowRight className="w-4 h-4 ml-2" /></>}
                            </Button>
                            <Button
                              onClick={() => { setLookupMode(false); setLookupTxnId("") }}
                              className="h-12 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold"
                            >
                              Back
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        /* PURCHASE MODE */
                        <>
                          {/* Quantity Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {presetQtys.map((item, i) => (
                              <motion.button key={item.qty}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.2 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectQty(item.qty)}
                                disabled={item.qty > stock || purchaseStatus === "processing"}
                                className={`p-4 rounded-xl transition-all font-bold text-sm relative ${!isCustom && selectedQty === item.qty
                                  ? "bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-white border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20"
                                  : "bg-white/5 text-white/80 border border-white/10 hover:border-white/30 hover:bg-white/10"
                                  } ${item.qty > stock ? "opacity-40 cursor-not-allowed" : ""}`}>
                                {item.popular && (
                                  <span className="absolute -top-2.5 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-orange-500/30">
                                    POPULAR
                                  </span>
                                )}
                                <div className="text-lg">{item.label}</div>
                                <div className="text-sm mt-1 text-cyan-300">₹{item.qty * pricePerID}</div>
                              </motion.button>
                            ))}
                          </div>

                          {/* Custom */}
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setIsCustom(true)}
                            className={`p-4 rounded-xl transition-all cursor-pointer mb-5 ${isCustom ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/40" : "bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10"
                              }`}>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-white">Custom Quantity</span>
                              <Input type="number" placeholder="Enter qty" value={customQty} onChange={(e) => handleCustomQty(e.target.value)}
                                min={1} max={stock} className="w-full h-10 text-center bg-black/30 border-white/20 text-white font-bold text-sm placeholder-white/40" disabled={purchaseStatus === "processing"} />
                              {isCustom && parseInt(customQty) > 0 && (
                                <span className="text-cyan-300 font-bold ml-auto text-lg">₹{parseInt(customQty) * pricePerID}</span>
                              )}
                            </div>
                          </motion.div>

                          {/* Total & Pay */}
                          {quantity > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                              <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 mb-4">
                                <span className="text-white/70 font-semibold">Total Amount</span>
                                <div className="text-right">
                                  <span className="text-4xl font-bold text-white block">₹{totalPrice}</span>
                                  <p className="text-sm text-white/50">{quantity} × ₹{pricePerID}</p>
                                </div>
                              </div>

                              <Button onClick={handlePurchase} disabled={purchaseStatus === "processing" || stock === 0 || quantity > stock}
                                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {purchaseStatus === "processing" ? (
                                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Payment...</>
                                ) : (
                                  <>Pay ₹{totalPrice} via UPI <ArrowRight className="w-5 h-5 ml-2" /></>
                                )}
                              </Button>

                              <div className="flex items-center justify-center gap-8 mt-5 text-sm text-white/50">
                                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Secure</span>
                                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Instant</span>
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> 24/7</span>
                              </div>
                            </motion.div>
                          )}

                          {purchaseStatus === "failed" && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                              className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                              <div className="text-sm text-red-200 font-medium">Payment failed. Please try again.</div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Hero Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                  Premium IRCTC Accounts,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400">Delivered Instantly</span>
                </h2>
                <p className="text-white/60 text-lg leading-relaxed max-w-lg">
                  Verified accounts ready for immediate use. Secure payment, instant delivery, round-the-clock support.
                </p>
              </motion.div>

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl"
              >
                <h3 className="text-sm font-bold text-cyan-400 mb-5 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Why Choose Us
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Zap, title: "Lightning Fast", desc: "Credentials delivered in under 3 seconds", color: "text-amber-400 bg-amber-500/20 border-amber-500/20" },
                    { icon: Shield, title: "100% Verified", desc: "Every account tested and ready to use", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/20" },
                    { icon: Award, title: "Premium Quality", desc: "Fresh accounts with full access", color: "text-purple-400 bg-purple-500/20 border-purple-500/20" },
                    { icon: Headphones, title: "24/7 Support", desc: "Always available on WhatsApp", color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/20" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex gap-4 items-start group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <div className={`w-11 h-11 rounded-xl ${item.color} border flex items-center justify-center transition-all group-hover:scale-110`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">{item.title}</h4>
                        <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { value: "10K+", label: "Delivered", icon: Package, color: "from-cyan-500/20 to-blue-600/20 border-cyan-500/30" },
                  { value: "4.9", label: "Rating", icon: Star, color: "from-amber-500/20 to-orange-500/20 border-amber-500/30" },
                  { value: "24/7", label: "Support", icon: Headphones, color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`bg-gradient-to-br ${stat.color} border rounded-xl p-5 text-center shadow-lg cursor-pointer`}
                  >
                    <stat.icon className="w-6 h-6 text-white/70 mx-auto mb-2" />
                    <div className="font-bold text-white text-2xl">{stat.value}</div>
                    <div className="text-white/50 text-xs font-semibold mt-1 uppercase tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* FAQ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl"
              >
                <h4 className="text-sm font-bold text-cyan-400 mb-5 uppercase tracking-wider">Frequently Asked</h4>
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                      <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                        <span className="font-semibold text-sm text-white">{faq.q}</span>
                        <motion.div animate={{ rotate: openFaq === idx ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/50">
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {openFaq === idx && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="bg-white/5 border-t border-white/10 px-4 py-4 text-white/60 text-sm leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl py-10 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Waves className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">OceanIDs</span>
                  <span className="text-white/40 text-sm ml-2">Trusted IRCTC Provider</span>
                </div>
              </div>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank"
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20">
                <MessageCircle className="w-5 h-5" /> WhatsApp Support
              </a>
            </div>
            <div className="text-center text-sm text-white/40">
              <p>© {new Date().getFullYear()} OceanIDs. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

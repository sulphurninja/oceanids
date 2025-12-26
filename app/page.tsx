"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Waves, Shield, Zap, Clock, CheckCircle, Download, Copy, Loader2, 
  AlertCircle, Package, MessageCircle, ChevronDown, Sparkles, TrendingUp
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
    if (quantity <= 0) { toast.error("Select a quantity!"); return }
    if (quantity > stock) { toast.error("Not enough stock available."); return }
    setPurchaseStatus("processing")
    try {
      const res = await fetch("/api/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) })
      const data = await res.json()
      if (data.success && data.paymentUrl) { window.location.href = data.paymentUrl }
      else { toast.error(data.message || "Something went wrong."); setPurchaseStatus("idle") }
    } catch (error) { toast.error("Something went wrong."); setPurchaseStatus("idle") }
  }

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!") }
  const copyAllCredentials = () => {
    const text = purchasedAccounts.map((acc, i) => `ID ${i + 1}: ${acc.username} | ${acc.password}`).join("\n")
    navigator.clipboard.writeText(text); toast.success("All copied!")
  }
  const downloadCSV = () => {
    const headers = ["Sr", "Username", "Password", "Mobile", "Email"]
    const rows = purchasedAccounts.map((acc, i) => [i + 1, acc.username, acc.password, acc.mobileNumber || "", acc.email || ""])
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `irctc_ids_${orderId || Date.now()}.csv`; a.click()
    window.URL.revokeObjectURL(url); toast.success("Downloaded!")
  }

  useEffect(() => {
    // Handle malformed URLs from UPI Gateway with multiple ? characters
    let urlString = window.location.href
    // Fix malformed URL by replacing ? with & after the first ?
    const firstQuestionMark = urlString.indexOf('?')
    if (firstQuestionMark !== -1) {
      const beforeQuery = urlString.substring(0, firstQuestionMark + 1)
      const afterQuery = urlString.substring(firstQuestionMark + 1).replace(/\?/g, '&')
      urlString = beforeQuery + afterQuery
    }

    const url = new URL(urlString)
    const urlParams = url.searchParams
    // Handle both order_id (from callback) and client_txn_id (from UPI Gateway direct redirect)
    const paymentOrderId = urlParams.get("order_id") || urlParams.get("client_txn_id")
    const status = urlParams.get("status")
    
    if (paymentOrderId && (status === "success" || !status)) { 
      // If no status param but client_txn_id is present, assume success (UPI Gateway direct redirect)
      setOrderId(paymentOrderId)
      setPurchaseStatus("processing")
      checkPaymentAndGetCredentials(paymentOrderId) 
    }
    else if (status === "failed") { 
      setPurchaseStatus("failed")
      toast.error("Payment failed.")
      window.history.replaceState({}, "", "/") 
    }
  }, [])

  const checkPaymentAndGetCredentials = async (oid: string) => {
    try {
      console.log('[VERIFY] Checking payment status for order:', oid);
      
      // First, verify with UPI Gateway directly
      const upiGatewayKey = process.env.NEXT_PUBLIC_UPI_GATEWAY_KEY;
      
      if (upiGatewayKey) {
        // Query UPI Gateway to check payment status
        const verifyResponse = await fetch('/api/purchase/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: oid })
        });
        
        const verifyData = await verifyResponse.json();
        console.log('[VERIFY] Payment verification response:', verifyData);
        
        if (verifyData.success && verifyData.accounts) {
          setPurchasedAccounts(verifyData.accounts)
          setPurchaseStatus("success")
          fetchStock()
          window.history.replaceState({}, "", "/")
          return
        } else if (verifyData.pending) {
          // Payment still processing, check again
          setTimeout(() => checkPaymentAndGetCredentials(oid), 2000)
          return
        }
      }
      
      // Fallback: Check database
      const res = await fetch(`/api/purchase/verify?order_id=${oid}`)
      const data = await res.json()
      
      if (data.success && data.accounts) {
        setPurchasedAccounts(data.accounts)
        setPurchaseStatus("success")
        fetchStock()
        window.history.replaceState({}, "", "/")
      }
      else if (data.pending) {
        setTimeout(() => checkPaymentAndGetCredentials(oid), 2000)
      }
      else {
        setPurchaseStatus("failed")
        toast.error(data.message || "Verification failed.")
        window.history.replaceState({}, "", "/")
      }
    } catch (error) {
      console.error('[VERIFY] Error:', error)
      setPurchaseStatus("failed")
      toast.error("Verification failed.")
      window.history.replaceState({}, "", "/")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* WhatsApp Button */}
      <a href={`https://wa.me/${whatsappNumber}?text=Need IRCTC IDs`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-2xl">
        <MessageCircle className="w-6 h-6 text-white" />
      </a>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-0 hover:opacity-20 transition-opacity"></div>
                <Waves className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">OceanIDs</h1>
                <p className="text-[10px] text-blue-300">IRCTC Accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="hidden sm:flex items-center gap-1.5 text-sm text-blue-300 hover:text-blue-200 transition-colors font-medium">
                <MessageCircle className="w-4 h-4" /> Support
              </a>
              <a href="/admin" className="text-xs text-white/50 hover:text-white font-medium">Admin</a>
            </div>
          </div>
        </header>

        {/* Main Content: Two Column Layout */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
            {/* Left Column: Purchase Form */}
            <div className="lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
            {purchaseStatus === "success" && purchasedAccounts.length > 0 ? (
              /* SUCCESS */
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-1">🚀 All Set!</h2>
                  <p className="text-green-200">{purchasedAccounts.length} {purchasedAccounts.length > 1 ? "IDs" : "ID"} ready to use</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <Button onClick={copyAllCredentials} className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                    <Copy className="w-4 h-4 mr-2" /> Copy All
                  </Button>
                  <Button onClick={downloadCSV} className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {purchasedAccounts.map((acc, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05, duration: 0.2 }}
                      className="bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-300 bg-green-500/20 px-2.5 py-0.5 rounded-full">ID {idx + 1}</span>
                        <button onClick={() => copyToClipboard(`${acc.username}:${acc.password}`)} className="text-white/40 hover:text-white transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-white/60 mb-1 font-medium">Username</p><p className="font-mono font-bold text-cyan-300 break-all text-xs">{acc.username}</p></div>
                        <div><p className="text-white/60 mb-1 font-medium">Password</p><p className="font-mono font-bold text-cyan-300 break-all text-xs">{acc.password}</p></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button onClick={() => { setPurchaseStatus("idle"); setPurchasedAccounts([]); setOrderId("") }}
                  className="w-full mt-4 text-white/70 hover:text-white text-sm py-2 transition-colors font-medium">
                  ← Get more IDs
                </button>
              </motion.div>
            ) : (
              /* PURCHASE FORM */
              <motion.div key="purchase" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-shadow">
                
                {/* Stock Status */}
                {stock > 0 && (
                  <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-500"></div>
                      <span className="text-sm font-bold text-white">{stock} IDs Available</span>
                    </div>
                    {stock <= 20 && (
                      <span className="text-xs font-bold text-orange-300 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-500/30">⚡ Limited Stock</span>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">How many IDs?</h3>
                    <p className="text-sm text-blue-300/80">₹{pricePerID} each • Instant delivery • 100% verified</p>
                  </div>

                  {/* Quantity Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {presetQtys.map((item, i) => (
                      <motion.button key={item.qty} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        onClick={() => handleSelectQty(item.qty)}
                        disabled={item.qty > stock || purchaseStatus === "processing"}
                        className={`p-4 rounded-xl transition-all font-bold text-sm relative group ${
                          !isCustom && selectedQty === item.qty
                            ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white border border-blue-400 shadow-lg shadow-blue-500/50"
                            : "bg-white/5 text-white border border-white/20 hover:border-white/40 hover:bg-white/10"
                        } ${item.qty > stock ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {item.popular && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                            🔥 Popular
                          </span>
                        )}
                        <div>{item.label}</div>
                        <div className="text-xs mt-1 opacity-90">₹{item.qty * pricePerID}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Custom */}
                  <div onClick={() => setIsCustom(true)}
                    className={`p-4 rounded-xl transition-all cursor-pointer mb-4 ${
                      isCustom ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-2 border-blue-400" : "bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/10"
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Custom</span>
                      <Input type="number" placeholder="Qty" value={customQty} onChange={(e) => handleCustomQty(e.target.value)}
                        min={1} max={stock} className="w-20 h-10 text-center bg-slate-900/50 border-white/20 text-white font-bold text-sm placeholder-white/30" disabled={purchaseStatus === "processing"} />
                      {isCustom && parseInt(customQty) > 0 && (
                        <span className="text-cyan-300 font-bold ml-auto text-sm">₹{parseInt(customQty) * pricePerID}</span>
                      )}
                    </div>
                  </div>

                  {/* Total & Pay */}
                  {quantity > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border border-blue-400/30 mb-4 backdrop-blur">
                        <span className="text-white/80 font-medium text-sm">Total</span>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-cyan-300 block">₹{totalPrice}</span>
                          <p className="text-xs text-white/60">{quantity} × ₹{pricePerID}</p>
                        </div>
                      </div>

                      <Button onClick={handlePurchase} disabled={purchaseStatus === "processing" || stock === 0 || quantity > stock}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {purchaseStatus === "processing" ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                        ) : (
                          <><Sparkles className="w-5 h-5 mr-2" /> Pay ₹{totalPrice} via UPI</>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/60">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> Secure</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> Instant</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-400" /> 24/7</span>
                      </div>
                    </motion.div>
                  )}

                  {purchaseStatus === "failed" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="text-sm text-red-200">Payment failed. Try again.</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
              </AnimatePresence>
            </div>

            {/* Right Column: Descriptions */}
            <div className="space-y-6">
              {/* Key Features */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" /> Why OceanIDs?
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: "⚡", title: "Lightning Fast", desc: "Credentials in 2 seconds" },
                    { icon: "✅", title: "100% Verified", desc: "Fresh accounts, tested & ready" },
                    { icon: "🛡️", title: "Completely Safe", desc: "Secure UPI payments" },
                    { icon: "💬", title: "Always Available", desc: "24/7 WhatsApp support" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start group cursor-pointer">
                      <div className="text-3xl group-hover:text-cyan-300 transition-colors">{item.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">{item.title}</h4>
                        <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "10K+", label: "Sold", icon: "📦", color: "from-blue-600 to-cyan-600" },
                  { value: "4.9★", label: "Rating", icon: "⭐", color: "from-yellow-600 to-orange-600" },
                  { value: "24/7", label: "Support", icon: "💬", color: "from-green-600 to-emerald-600" },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-center shadow-lg hover:shadow-2xl transition-shadow cursor-pointer`}>
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="font-bold text-white text-lg">{stat.value}</div>
                    <div className="text-white/80 text-xs font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
                <h4 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> FAQ
                </h4>
                <div className="space-y-2">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
                      <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                        <span className="font-medium text-xs text-white">{faq.q}</span>
                        <motion.div animate={{ rotate: openFaq === idx ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/60">
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {openFaq === idx && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="bg-white/5 border-t border-white/10 px-3 py-3 text-white/80 text-xs leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 flex items-center justify-center shadow-lg">
                  <Waves className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white">OceanIDs</span>
                  <span className="text-white/60 text-xs ml-2">Trusted IRCTC Provider</span>
                </div>
              </div>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-xl">
                <MessageCircle className="w-4 h-4" /> WhatsApp Support
              </a>
            </div>
            <div className="text-center text-xs text-white/50">
              <p>© {new Date().getFullYear()} OceanIDs. All rights reserved. Independent service.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

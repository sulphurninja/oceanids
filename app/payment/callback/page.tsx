"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Train } from "lucide-react"
import Link from "next/link"

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")

  const orderId = searchParams.get("order_id")

  useEffect(() => {
    if (!orderId) {
      setStatus("failed")
      setMessage("Invalid payment callback")
      return
    }

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderId}`)
        const data = await res.json()

        if (data.success && data.order?.paymentStatus === "completed") {
          setStatus("success")
          setMessage("Payment successful! Your account is ready.")
        } else if (data.order?.paymentStatus === "pending") {
          // Keep checking for a bit
          setTimeout(checkPaymentStatus, 2000)
        } else {
          setStatus("failed")
          setMessage(data.message || "Payment verification failed")
        }
      } catch (error) {
        setStatus("failed")
        setMessage("Error verifying payment")
      }
    }

    // Wait a moment for webhook to process
    setTimeout(checkPaymentStatus, 1500)
  }, [orderId])

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {status === "loading" && (
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            )}
            {status === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            )}
            {status === "failed" && (
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Processing Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          )}
          {status === "success" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your IRCTC account credentials are now available in your dashboard.
              </p>
              <Link href="/dashboard">
                <Button className="w-full" size="lg">
                  <Train className="w-4 h-4 mr-2" />
                  View Your Account
                </Button>
              </Link>
            </div>
          )}
          {status === "failed" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Something went wrong with your payment. Please try again or contact support.
              </p>
              <div className="flex gap-3">
                <Link href="/buy" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Try Again
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full">Dashboard</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


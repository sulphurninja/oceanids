import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';

// Test payment page for development
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');

  if (!orderId) {
    return new NextResponse('Order ID required', { status: 400 });
  }

  // Simple HTML payment simulator
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Payment</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: system-ui, sans-serif; 
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: white;
        }
        .card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
        }
        h1 { font-size: 24px; margin-bottom: 10px; }
        .amount { font-size: 48px; font-weight: bold; margin: 20px 0; color: #00d4ff; }
        .order-id { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 30px; }
        .warning { 
          background: rgba(255,200,0,0.2); 
          border: 1px solid rgba(255,200,0,0.3);
          padding: 15px; 
          border-radius: 10px; 
          margin-bottom: 20px;
          font-size: 14px;
          color: #ffd700;
        }
        .btn {
          display: block;
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-bottom: 10px;
          transition: transform 0.2s;
        }
        .btn:hover { transform: scale(1.02); }
        .btn-success { background: linear-gradient(135deg, #00d4ff, #00ff88); color: #000; }
        .btn-fail { background: rgba(255,100,100,0.3); color: #ff6b6b; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🧪 Test Payment</h1>
        <div class="amount">₹${amount}</div>
        <div class="order-id">Order: ${orderId}</div>
        <div class="warning">⚠️ This is a TEST payment simulator. Set UPI_GATEWAY_KEY in .env for real payments.</div>
        <button class="btn btn-success" onclick="simulateSuccess()">✅ Simulate Success</button>
        <button class="btn btn-fail" onclick="simulateFail()">❌ Simulate Failure</button>
      </div>
      <script>
        async function simulateSuccess() {
          try {
            await fetch('/api/purchase/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_txn_id: '${orderId}',
                status: 'success',
                txnId: 'TEST_' + Date.now(),
                amount: '${amount}'
              })
            });
            window.location.href = '/?order_id=${orderId}&status=success';
          } catch (e) {
            alert('Error: ' + e.message);
          }
        }
        async function simulateFail() {
          try {
            await fetch('/api/purchase/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_txn_id: '${orderId}',
                status: 'failure',
                amount: '${amount}'
              })
            });
            window.location.href = '/?order_id=${orderId}&status=failed';
          } catch (e) {
            alert('Error: ' + e.message);
          }
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}


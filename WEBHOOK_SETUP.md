# UPI Gateway Webhook Setup

## Webhook Configuration

In the UPI Gateway dashboard, set the **Webhook URL** to:

```
https://oceanids.vercel.app/api/purchase/callback
```

## How It Works

### Payment Flow:
1. User initiates payment on homepage
2. Redirected to UPI Gateway to pay
3. User completes UPI payment
4. UPI Gateway sends webhook (form-urlencoded POST) to `/api/purchase/callback`
5. Our webhook handler:
   - Receives: `client_txn_id`, `status`, `upi_txn_id`, `txnAt`
   - Marks order as `completed` (if status=success)
   - Marks accounts as `sold`
   - Logs transaction details

### User Redirect:
After payment, UPI Gateway also redirects user back to:
```
https://oceanids.vercel.app/?client_txn_id=TXN...&txn_id=...
```

### Frontend Verification:
1. Frontend detects `client_txn_id` in URL
2. Calls `/api/purchase/verify?order_id={client_txn_id}`
3. Backend checks order status in database
4. If webhook already marked as completed → returns credentials
5. Credentials displayed on page ✅

## Webhook Handler Details

**Endpoint:** `POST /api/purchase/callback`

**Expected Form Data:**
- `client_txn_id` - Order ID (passed in create_order request)
- `status` - "success" or "failure"
- `upi_txn_id` - UPI transaction ID
- `txnAt` - Transaction timestamp (YYYY-MM-DD format)

**Response:** Always returns `{ success: true }`

## Key Points

✅ Webhook is **form-urlencoded**, not JSON
✅ Webhook marks order as paid in database
✅ Frontend polls verify endpoint which checks the paid status
✅ Credentials returned to user immediately
✅ Failed payments release accounts back to stock


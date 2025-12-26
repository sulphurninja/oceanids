# Cleanup for Expired Pending Orders

## Overview

This cleanup service automatically releases reserved account IDs back to inventory if their payment is not completed within 30 minutes.

## Endpoint

```
GET /api/cleanup/expired-orders
```

## How It Works

1. **Checks for Expired Orders**: Finds all orders with `paymentStatus === 'pending'` that were created more than 30 minutes ago
2. **Releases Accounts**: Marks all reserved accounts in those orders as `'available'` again
3. **Marks Order as Failed**: Updates the order status to `'failed'` and `'cancelled'`

## Response

```json
{
  "success": true,
  "message": "Cleaned up X expired orders",
  "expiredOrdersCount": 5
}
```

## Automatic Cleanup

### Option 1: Using EasyCron (Free External Cron)

1. Go to https://www.easycron.com
2. Create a new cron job
3. **Cron expression**: `0 * * * *` (every hour) or `0 */6 * * *` (every 6 hours)
4. **URL**: `https://oceanids.vercel.app/api/cleanup/expired-orders`
5. **Request method**: GET
6. Save and activate

### Option 2: Using Vercel Cron (Self-Hosted)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cleanup/expired-orders",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Option 3: Called from Stock Endpoint

The cleanup function is already called every time someone checks stock (`/api/stock`), so it runs at least whenever users visit the site.

## Additional Safety

The cleanup is also triggered in:
- `/api/stock` - When checking available inventory
- `/api/purchase/verify` - When user checks order status and it has expired (30 min timeout)
- `/api/purchase/callback` - When UPI Gateway webhook arrives with failure status

This ensures that:
1. **Automatic cleanup** happens regularly via cron
2. **On-demand cleanup** happens when users interact with the system
3. **Webhook-based cleanup** happens immediately when payment fails
4. **Lazy cleanup** happens when verify endpoint detects expired pending order


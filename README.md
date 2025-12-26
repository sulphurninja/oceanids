# OceanIDs - Premium IRCTC Account Store

A modern Next.js application for selling IRCTC accounts with instant delivery, built with the same tech stack as OceanLinux.

## Features

### For Users
- 🚀 **Instant Delivery** - Get account credentials immediately after payment
- 💳 **Secure Payments** - UPI payments via UPI Gateway
- 📱 **Modern UI** - Beautiful, responsive design with modern dark theme
- 🔐 **JWT Authentication** - Secure login/signup system
- 📊 **Dashboard** - View and manage purchased accounts

### For Admins
- 📦 **Stock Management** - Add accounts individually or bulk import
- 📈 **Analytics Dashboard** - View sales, revenue, and stock stats
- 👥 **User Management** - View users and manage admin access
- 🛒 **Order Management** - Track all orders and their status

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB with Mongoose
- **Auth**: JWT with HTTP-only cookies
- **Payments**: UPI Gateway (https://upigateway.com/)
- **Animations**: Framer Motion
- **Notifications**: Sonner

## Getting Started

### 1. Install Dependencies

```bash
cd oceanids
bun install
# or
npm install
```

### 2. Environment Setup

Create a `.env` file based on `env.example`:

```env
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key

# UPI Gateway API Key
UPI_GATEWAY_KEY=your-upi-gateway-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
bun dev
# or
npm run dev
```

App runs on [http://localhost:3001](http://localhost:3001)

## Account Types & Pricing

| Type | Price | Features |
|------|-------|----------|
| Standard | ₹149 | Fresh account, instant delivery |
| Premium | ₹299 | Verified, priority support, free replacement |
| Verified | ₹499 | Mobile verified, VIP support, lifetime guarantee |

## Admin Setup

To make a user an admin:

1. Create an account via signup
2. In MongoDB, set `isAdmin: true` for that user:
```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

## Adding Stock (Admin)

### Single/Multiple Accounts
1. Go to Admin → Add Accounts
2. Fill in username, password, select type
3. Add more accounts if needed
4. Click "Add Accounts"

### Bulk Import
1. Go to Admin → Add Accounts → Bulk Import
2. Paste accounts in format:
```
username1:password1
username2:password2:mobile:email
```
3. Click "Parse & Preview" then "Add Accounts"

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User
- `GET /api/orders` - Get user's orders
- `GET /api/accounts/stock` - Get available stock count

### Payment
- `POST /api/purchase` - Create purchase order (get payment URL)
- `GET /api/purchase/verify` - Verify payment status
- `POST /api/payment/webhook` - UPI Gateway webhook
- `POST /api/purchase/callback` - Payment callback handler

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET/POST /api/admin/accounts` - Manage accounts
- `DELETE /api/admin/accounts/:id` - Delete account
- `GET /api/admin/orders` - All orders
- `GET /api/admin/users` - All users
- `PATCH /api/admin/users/:id` - Update user

## Deployment

Deploy to Vercel:

```bash
vercel
```

Remember to:
1. Set all environment variables in Vercel
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Set `UPI_GATEWAY_KEY` to your production API key
4. Configure UPI Gateway webhook URL: `https://yourdomain.com/api/payment/webhook`

## License

Private - OceanLinux

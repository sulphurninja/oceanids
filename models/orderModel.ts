import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  // User who placed order (optional for anonymous purchases)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Multiple accounts for bulk purchase
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  }],
  // Legacy single account field (backwards compatibility)
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  },
  // Account type at time of purchase
  accountType: {
    type: String,
    default: 'irctc',
  },
  // Provider (e.g., 'irctc', 'paytm')
  provider: {
    type: String,
    default: 'irctc',
  },
  // Quantity
  quantity: {
    type: Number,
    default: 1,
  },
  // Pricing
  amount: {
    type: Number,
    required: true,
  },
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'upi',
  },
  // UPI Gateway payment details
  clientTxnId: {
    type: String,
    default: '',
  },
  gatewayOrderId: {
    type: String,
    default: '',
  },
  transactionId: {
    type: String,
    default: '',
  },
  upiTxnId: {
    type: String,
    default: '',
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  // Delivery - credentials revealed after payment
  credentialsRevealed: {
    type: Boolean,
    default: false,
  },
  revealedAt: {
    type: Date,
    default: null,
  },
  // Customer info (optional for anonymous)
  customerEmail: {
    type: String,
    default: '',
  },
  customerName: {
    type: String,
    default: 'Guest',
  },
  customerPhone: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Indexes
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ clientTxnId: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;

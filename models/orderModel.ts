import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  // User who placed order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Account purchased
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  // Account type at time of purchase
  accountType: {
    type: String,
    required: true,
  },
  // Provider (e.g., 'irctc', 'paytm')
  provider: {
    type: String,
    default: 'irctc',
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
    default: 'cashfree',
  },
  // Cashfree payment details
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
  // Customer info at time of purchase
  customerEmail: {
    type: String,
  },
  customerName: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ clientTxnId: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;


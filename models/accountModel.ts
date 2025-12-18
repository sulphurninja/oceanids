import mongoose from 'mongoose';

// Account/Stock model - supports multiple providers (IRCTC, etc.)
const accountSchema = new mongoose.Schema({
  // Provider info (e.g., IRCTC, Paytm, etc.)
  provider: {
    type: String,
    required: true,
    default: 'irctc',
  },
  // Credentials
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Pricing (admin can set per account, defaults to provider price)
  price: {
    type: Number,
    required: true,
    default: 400,
  },
  // Status
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'disabled'],
    default: 'available',
  },
  // Additional info (optional)
  mobileNumber: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  // Who bought it
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  soldAt: {
    type: Date,
    default: null,
  },
  // Order reference
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  // Admin notes
  notes: {
    type: String,
    default: '',
  },
  // Added by which admin
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for fast queries
accountSchema.index({ status: 1, provider: 1 });
accountSchema.index({ soldTo: 1 });

const Account = mongoose.models.Account || mongoose.model('Account', accountSchema);

export default Account;

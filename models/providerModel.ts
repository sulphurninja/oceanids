import mongoose from 'mongoose';

// Provider model - different account types admin can sell
const providerSchema = new mongoose.Schema({
  // Unique identifier (e.g., 'irctc', 'paytm')
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  // Display name
  name: {
    type: String,
    required: true,
  },
  // Description
  description: {
    type: String,
    default: '',
  },
  // Default price for this provider's accounts
  price: {
    type: Number,
    required: true,
    default: 400,
  },
  // Icon name (lucide icon)
  icon: {
    type: String,
    default: 'Package',
  },
  // Color theme
  color: {
    type: String,
    default: 'primary',
  },
  // Features list
  features: [{
    type: String,
  }],
  // Is this provider active?
  isActive: {
    type: Boolean,
    default: true,
  },
  // Display order
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Provider = mongoose.models.Provider || mongoose.model('Provider', providerSchema);

export default Provider;


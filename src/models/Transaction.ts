import mongoose, { Schema, model, models } from 'mongoose';

const TransactionSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
  amount: { type: Number, required: true }, // Positive for "You Gave", Negative for "You Got"
  description: { type: String },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['GAVE', 'GOT'], required: true },
}, { timestamps: true });

const Transaction = models.Transaction || model('Transaction', TransactionSchema);
export default Transaction;

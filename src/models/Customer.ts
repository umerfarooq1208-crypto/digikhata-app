import mongoose, { Schema, model, models } from 'mongoose';

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 }, // Positive = You will get, Negative = You will give
}, { timestamps: true });

const Customer = models.Customer || model('Customer', CustomerSchema);
export default Customer;

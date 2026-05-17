import mongoose, { Schema, model, models } from 'mongoose';

const SaleSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  profit: { type: Number, required: true }, // Total profit for this sale
  totalRevenue: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
}, { timestamps: true });

const Sale = models.Sale || model('Sale', SaleSchema);
export default Sale;

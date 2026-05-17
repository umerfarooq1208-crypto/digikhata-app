import mongoose, { Schema, model, models } from 'mongoose';

const BusinessSchema = new Schema({
  name: { type: String, required: true },
  currency: { type: String, default: 'Rs' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Business = models.Business || model('Business', BusinessSchema);
export default Business;

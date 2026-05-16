import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  resetOTP: { type: String },
  resetOTPExpires: { type: Date },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;

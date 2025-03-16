import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, unique: true, default: "" },
    status: { type: String, default: "pending" },
    callback_url: { type: String },
  },
  { timestamps: true }
);


export default mongoose.model("Payment", paymentSchema);

import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  type: String, // income / expense
  amount: Number,
  category: String,
  description: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
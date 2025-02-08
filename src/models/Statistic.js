import mongoose from "mongoose";

const statisticSchema = new mongoose.Schema({
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalUsers: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Statistic = mongoose.model("Statistic", statisticSchema);

export default Statistic;

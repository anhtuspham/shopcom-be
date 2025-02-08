import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    required: true,
    type: {
      type: String,
      enum: ["order", "review", "message"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

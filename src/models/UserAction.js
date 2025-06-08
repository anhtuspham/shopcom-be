import mongoose from "mongoose";

  const userActionSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    actions: [{
      type: {
        type: String,
        enum: ["view", "addToCart", "purchase", "rate", "viewBrand"],
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    totalScore: {
      type: Number,
      default: 0,
    },
  });

  userActionSchema.pre("save", function (next) {
    this.totalScore = this.actions.reduce((sum, action) => sum + action.score, 0);
    next();
  });

  const UserAction = mongoose.model("UserAction", userActionSchema);

  export default UserAction;
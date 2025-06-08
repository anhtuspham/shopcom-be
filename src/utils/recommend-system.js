import mongoose from "mongoose";
import UserAction from "../models/UserAction.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const recordAction = async (userId, productId, actionType) => {
  const scoreMap = {
    view: 1,
    addToCart: 3,
    purchase: 5,
    rate: 4,
    viewBrand: 2,
  };
  const action = {
    type: actionType,
    score: scoreMap[actionType],
    timestamp: new Date(),
  };

  let userAction = await UserAction.findOne({ userId, productId });
  if (!userAction) {
    userAction = new UserAction({ userId, productId, actions: [action] });
  } else {
    userAction.actions.push(action);
  }
  await userAction.save();
};

const getUserProductMatrix = async () => {
  const actions = await UserAction.find().lean();
  const users = await User.find().lean();
  const products = await Product.find().lean();

  const userIds = users.map(u => u._id.toString());
  const productIds = products.map(p => p._id.toString());

  const matrix = Array(userIds.length).fill().map(() => Array(productIds.length).fill(0));

  actions.forEach(action => {
    const userIndex = userIds.indexOf(action.userId.toString());
    const productIndex = productIds.indexOf(action.productId.toString());
    if (userIndex !== -1 && productIndex !== -1) {
      matrix[userIndex][productIndex] = action.totalScore;
    }
  });

  return { matrix, userIds, productIds };
};

const decayScores = async () => {
  const actions = await UserAction.find();
  const now = new Date();
  for (const action of actions) {
    action.actions = action.actions.map(a => {
      const daysOld = (now - a.timestamp) / (1000 * 60 * 60 * 24);
      a.score = a.score * Math.exp(-0.05 * daysOld); // Suy giảm theo thời gian
      return a;
    });
    action.totalScore = action.actions.reduce((sum, a) => sum + a.score, 0);
    await action.save();
  }
};

export { recordAction, getUserProductMatrix, decayScores };
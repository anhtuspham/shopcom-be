import cron from "node-cron";
import UserAction from "../models/UserAction.js"
import { trainAndSaveModel, decayScores } from "./recommendation.js";

cron.schedule("0 * * * *", async () => {
  console.log("Running hourly model training and score decay...");
  try {
    const lastAction = await UserAction.findOne().sort({ updatedAt: -1 });
    const lastUpdate = lastAction ? lastAction.updatedAt : new Date(0);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (lastUpdate > oneHourAgo) {
      console.log("New user actions detected, training model...");
      await decayScores();
      await trainAndSaveModel();
      console.log("Model training and score decay completed successfully");
    } else {
      console.log("No new user actions, skipping training");
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
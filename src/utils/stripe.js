import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, currency = "usd") => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method_types: ["card"],
    });
    return paymentIntent.client_secret;
  } catch (error) {
    console.error("Stripe Error:", error);
    throw new Error("Không thể tạo PaymentIntent");
  }
};
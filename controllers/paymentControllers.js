import paystack from '../config/paystack.js';
import Payment from '../model/paymentModel.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const initializePayment = async (req, res) => {
  try {
    const { email, callback_url, plan, customAmount } = req.body;
    
    
    if (!email || !callback_url) {
      return errorResponse(res, "Email and callback_url are required", 400);
    }
    
    
    // Default amount is 5000
    let amount = 5000;
    // If a premium plan is selected, set a higher amount which is the bases for the project
    if (plan && plan === "premium") {
      amount = 7000;
    }
    
    if (customAmount) {
      amount = customAmount;
    }

    
    const payment = await Payment.create({ email, amount, callback_url });

    // note this the amount is in  (amount is in kobo)
    const response = await paystack.post("/transaction/initialize", {
      email,
      amount: amount * 100,
      callback_url,
    });

    payment.reference = response.data.data.reference;
    await payment.save();

    return successResponse(res, "Payment initialized", response.data);
  } catch (error) {
    return errorResponse(
      res,
      error.response?.data || "Payment initialization failed",
      500
    );
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return errorResponse(res, "Payment record not found", 404);
    }

    // Verify payment status with Paystack
    const response = await paystack.get(`/transaction/verify/${reference}`);
    if (response.data.data.status !== "success") {
      payment.status = "failed";
      await payment.save();
      return errorResponse(res, "Payment verification failed", 400);
    }

    payment.status = "success";
    await payment.save();

    return successResponse(res, "Payment verified successfully", response.data);
  } catch (error) {
    return errorResponse(
      res,
      error.response?.data || "Payment verification failed",
      500
    );
  }
};

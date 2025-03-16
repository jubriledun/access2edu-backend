import Payment from '../model/paymentModel.js';

export const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const payment = await Payment.findOne({ reference });
      if (payment) {
        payment.status = "success";
        await payment.save();
      }
    }
    
    
    return res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).send("Webhook processing failed");
  }
};

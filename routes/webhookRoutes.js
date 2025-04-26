import express from "express";
import { paystackWebhook } from "../controllers/webhookControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/webhook/paystack:
 *   post:
 *     summary: Handle Paystack webhook events
 *     tags: [Webhook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: The type of event triggered by Paystack
 *               data:
 *                 type: object
 *                 description: The data payload sent by Paystack
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Bad request
 */
router.post("/paystack", paystackWebhook);

export default router;
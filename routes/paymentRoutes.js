import express from "express";
import { initializePayment, verifyPayment } from "../controllers/paymentControllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/payment/pay:
 *   post:
 *     summary: Initialize a payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user making the payment
 *               amount:
 *                 type: number
 *                 description: The amount to be paid (in kobo for Paystack)
 *               callback_url:
 *                 type: string
 *                 description: The URL to redirect to after payment
 *               plan:
 *                 type: string
 *                 description: The payment plan (e.g., "basic" or "premium")
 *               customAmount:
 *                 type: number
 *                 description: A custom amount to override the default
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                     access_code:
 *                       type: string
 *                     reference:
 *                       type: string
 *       400:
 *         description: Bad request
 */
router.post("/pay", initializePayment);

/**
 * @swagger
 * /api/payment/verify/{reference}:
 *   get:
 *     summary: Verify a payment
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: The payment reference to verify
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                     status:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     customer:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *       404:
 *         description: Payment not found
 */
router.get("/verify/:reference", verifyPayment);

export default router;
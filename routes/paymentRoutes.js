import express from 'express';
import { initializePayment, verifyPayment } from '../controllers/paymentControllers.js';

const router = express.Router();


router.post("/pay", initializePayment);
router.get("/verify/:reference", verifyPayment);

export default router;
require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const mongoose = require('mongoose');
const postmark = require("postmark");
const client = new postmark.ServerClient("784c4c4e-61c4-4f79-b0de-fa04987e4e64");

const router = express.Router();

const PaymentDetailsSchema = mongoose.Schema({
    razorpayDetails: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    success: Boolean,
  });

const PaymentDetails = mongoose.model('PatmentDetail', PaymentDetailsSchema);

router.post("/orders", async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: 50000, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_74394",
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});
router.post('/success', async (req, res) => {
    try {
      const {
        orderCreationId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      } = req.body;
  
    //   const shasum = crypto.createHmac('sha256', '<YOUR RAZORPAY SECRET>');
    //   shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    //   const digest = shasum.digest('hex');
  
    //   if (digest !== razorpaySignature)
    //     return res.status(400).json({ msg: 'Transaction not legit!' });
  
      const newPayment = PaymentDetails({
        razorpayDetails: {
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
        },
        success: true,
      });
  
      await newPayment.save();
  
      res.json({
        msg: 'success',
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
      });
      client.sendEmail({
        "From": "vanshmalik18@gmail.com",
        "To": "vanshmalik18@gmail.com",
        "Subject": "Razorpay success payment",
        "HtmlBody": "<strong>Razorpay</strong> Payment made successfully",
        "TextBody": "All set for payment",
        "MessageStream": "outbound"
      });
    } catch (error) {
        console.log(error)
      res.status(500).send(error);
    }
  });
  
module.exports = router;
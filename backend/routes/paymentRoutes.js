const express = require('express');
const router = express.Router();
const { createPaymentUrl } = require('../controllers/paymentController');

router.post('/create_payment_url', createPaymentUrl);

module.exports = router;
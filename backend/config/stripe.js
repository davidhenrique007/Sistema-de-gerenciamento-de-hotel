// backend/config/stripe.js
const Stripe = require('stripe');
require('dotenv').config();

const stripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123456789',
    currency: process.env.STRIPE_CURRENCY || 'mzn',
    apiVersion: '2025-02-24.acacia'
};

const stripe = new Stripe(stripeConfig.secretKey, {
    apiVersion: stripeConfig.apiVersion
});

module.exports = {
    stripe,
    stripeConfig
};

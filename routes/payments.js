const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));

// Create payment intent for order
router.post('/create-intent', async (req, res) => {
    try {
        const { orderId, amount, customerEmail, customerName } = req.body;

        // Validate amount (minimum 50 cents for Stripe)
        if (!amount || amount < 0.50) {
            return res.status(400).json({ 
                error: 'Invalid amount. Minimum charge is $0.50' 
            });
        }

        // Convert to cents for Stripe
        const amountInCents = Math.round(amount * 100);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: orderId.toString(),
                customerEmail: customerEmail || '',
                customerName: customerName || ''
            },
            receipt_email: customerEmail || undefined,
        });

        // Update order with payment intent ID
        db.run(
            'UPDATE orders SET payment_intent_id = ?, payment_status = ? WHERE id = ?',
            [paymentIntent.id, 'pending', orderId],
            function(err) {
                if (err) {
                    console.error('Failed to update order:', err);
                }
            }
        );

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ 
            error: 'Failed to create payment intent',
            message: error.message 
        });
    }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        if (endpointSecret && sig) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // For development without webhook secret
            event = JSON.parse(req.body);
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handlePaymentFailure(failedPayment);
            break;

        case 'charge.refunded':
            const refund = event.data.object;
            await handleRefund(refund);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
        console.error('No orderId in payment intent metadata');
        return;
    }

    // Update order status
    db.run(
        'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
        ['completed', 'confirmed', orderId],
        function(err) {
            if (err) {
                console.error('Failed to update order status:', err);
                return;
            }

            console.log(`Payment successful for order ${orderId}`);

            // Send confirmation email (in production)
            // sendOrderConfirmationEmail(orderId);
        }
    );
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) return;

    db.run(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        ['failed', orderId],
        function(err) {
            if (err) {
                console.error('Failed to update order status:', err);
                return;
            }

            console.log(`Payment failed for order ${orderId}`);
        }
    );
}

// Handle refund
async function handleRefund(charge) {
    const paymentIntentId = charge.payment_intent;

    // Find order by payment intent
    db.get(
        'SELECT id FROM orders WHERE payment_intent_id = ?',
        [paymentIntentId],
        function(err, row) {
            if (err || !row) {
                console.error('Order not found for refund');
                return;
            }

            db.run(
                'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
                ['refunded', 'refunded', row.id],
                function(err) {
                    if (err) {
                        console.error('Failed to process refund:', err);
                        return;
                    }

                    console.log(`Refund processed for order ${row.id}`);
                }
            );
        }
    );
}

// Get payment status
router.get('/status/:orderId', (req, res) => {
    const { orderId } = req.params;

    db.get(
        'SELECT payment_status, payment_intent_id FROM orders WHERE id = ?',
        [orderId],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!row) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.json({
                paymentStatus: row.payment_status,
                paymentIntentId: row.payment_intent_id
            });
        }
    );
});

// Create refund
router.post('/refund', async (req, res) => {
    try {
        const { orderId, amount, reason } = req.body;

        // Get payment intent from order
        db.get(
            'SELECT payment_intent_id, total_amount FROM orders WHERE id = ?',
            [orderId],
            async (err, row) => {
                if (err || !row) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                if (!row.payment_intent_id) {
                    return res.status(400).json({ error: 'No payment found for this order' });
                }

                // Calculate refund amount
                const refundAmount = amount ? Math.round(amount * 100) : undefined;

                // Create refund in Stripe
                const refund = await stripe.refunds.create({
                    payment_intent: row.payment_intent_id,
                    amount: refundAmount,
                    reason: reason || 'requested_by_customer'
                });

                // Update order
                const newStatus = refundAmount && refundAmount < (row.total_amount * 100) 
                    ? 'partially_refunded' 
                    : 'refunded';

                db.run(
                    'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
                    ['refunded', newStatus, orderId],
                    function(err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Failed to update order' });
                        }

                        res.json({
                            success: true,
                            refundId: refund.id,
                            amount: refund.amount / 100,
                            status: refund.status
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ 
            error: 'Failed to process refund',
            message: error.message 
        });
    }
});

// Get Stripe publishable key (for frontend)
router.get('/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

module.exports = router;
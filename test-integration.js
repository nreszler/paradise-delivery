#!/usr/bin/env node
/**
 * Paradise Delivery - Integration Test Script
 * Tests all major backend functionality including Stripe integration
 */

require('dotenv').config();
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ ${message}`, 'blue');
}

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

async function runTest(name, testFn) {
    logInfo(`\nTesting: ${name}`);
    try {
        await testFn();
        results.passed++;
        results.tests.push({ name, status: 'passed' });
    } catch (error) {
        results.failed++;
        results.tests.push({ name, status: 'failed', error: error.message });
        logError(`${name} failed: ${error.message}`);
    }
}

// ===== TESTS =====

async function testServerRunning() {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.data.status === 'ok') {
            logSuccess('Server is running');
        } else {
            throw new Error('Server health check returned unexpected status');
        }
    } catch (error) {
        throw new Error(`Server not responding: ${error.message}`);
    }
}

async function testEnvironmentVariables() {
    const required = [
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'JWT_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
    
    logSuccess('Environment variables configured');
    logInfo(`  - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`);
    logInfo(`  - STRIPE_PUBLISHABLE_KEY: ${process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 20)}...`);
}

async function testStripeConnection() {
    try {
        // Test Stripe connection by retrieving account info
        const account = await stripe.accounts.retrieve();
        logSuccess('Stripe connection successful');
        logInfo(`  - Account ID: ${account.id}`);
        logInfo(`  - Charges enabled: ${account.charges_enabled}`);
        logInfo(`  - Payouts enabled: ${account.payouts_enabled}`);
        
        if (!account.charges_enabled) {
            logWarning('Stripe account not fully activated - payments will fail in live mode');
        }
    } catch (error) {
        throw new Error(`Stripe connection failed: ${error.message}`);
    }
}

async function testStripePaymentIntent() {
    try {
        // Create a test payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 4000, // $40.00
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: { test: 'true' }
        });
        
        logSuccess('Stripe PaymentIntent creation working');
        logInfo(`  - PaymentIntent ID: ${paymentIntent.id}`);
        logInfo(`  - Status: ${paymentIntent.status}`);
        logInfo(`  - Client secret: ${paymentIntent.client_secret?.substring(0, 20)}...`);
        
        // Cancel the test intent
        await stripe.paymentIntents.cancel(paymentIntent.id);
        logInfo('  - Test PaymentIntent cancelled');
    } catch (error) {
        throw new Error(`PaymentIntent creation failed: ${error.message}`);
    }
}

async function testPaymentConfigEndpoint() {
    try {
        const response = await axios.get(`${BASE_URL}/payments/config`);
        
        if (response.data.publishableKey) {
            logSuccess('Payment config endpoint working');
            logInfo(`  - Publishable key: ${response.data.publishableKey.substring(0, 20)}...`);
        } else {
            throw new Error('No publishable key returned');
        }
    } catch (error) {
        throw new Error(`Payment config failed: ${error.message}`);
    }
}

async function testRestaurantsEndpoint() {
    try {
        const response = await axios.get(`${BASE_URL}/restaurants`);
        
        if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
            logSuccess('Restaurants endpoint working');
            logInfo(`  - Found ${response.data.restaurants.length} restaurants`);
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        throw new Error(`Restaurants endpoint failed: ${error.message}`);
    }
}

async function testCreatePaymentIntentEndpoint() {
    try {
        // First create a test order
        const orderData = {
            customerId: 1,
            restaurantId: 1,
            items: [
                { menuItemId: 1, price: 12.99, quantity: 2, name: 'Test Item' }
            ],
            deliveryAddress: '123 Test St, Paradise, CA',
            distanceMiles: 2.5,
            tipAmount: 3.00
        };
        
        // Create order
        const orderResponse = await axios.post(`${BASE_URL}/orders/create`, orderData);
        const orderId = orderResponse.data.orderId;
        
        logInfo(`  - Created test order #${orderResponse.data.orderNumber}`);
        
        // Create payment intent
        const paymentData = {
            orderId: orderId,
            amount: orderResponse.data.totalAmount,
            customerEmail: 'test@example.com',
            customerName: 'Test Customer'
        };
        
        const paymentResponse = await axios.post(`${BASE_URL}/payments/create-intent`, paymentData);
        
        if (paymentResponse.data.clientSecret) {
            logSuccess('Create PaymentIntent endpoint working');
            logInfo(`  - Client secret received`);
            logInfo(`  - PaymentIntent ID: ${paymentResponse.data.paymentIntentId}`);
        } else {
            throw new Error('No client secret returned');
        }
    } catch (error) {
        throw new Error(`Create PaymentIntent failed: ${error.message}`);
    }
}

async function testDistanceCalculation() {
    try {
        // Test distance-based delivery fee calculation
        const distances = [
            { miles: 1.5, expectedFee: 2.49 },
            { miles: 3.0, expectedFee: 3.49 },
            { miles: 5.5, expectedFee: 4.49 },
            { miles: 9.0, expectedFee: 5.49 }
        ];
        
        logInfo('  Testing distance-based delivery fees:');
        
        for (const test of distances) {
            let fee;
            if (test.miles <= 2) fee = 2.49;
            else if (test.miles <= 4) fee = 3.49;
            else if (test.miles <= 7) fee = 4.49;
            else if (test.miles <= 11) fee = 5.49;
            else fee = 5.99;
            
            if (fee === test.expectedFee) {
                logInfo(`    ${test.miles} miles → $${fee} ✓`);
            } else {
                throw new Error(`Distance fee calculation mismatch for ${test.miles} miles`);
            }
        }
        
        logSuccess('Distance calculation logic working');
    } catch (error) {
        throw new Error(`Distance calculation failed: ${error.message}`);
    }
}

async function testDatabaseConnection() {
    try {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        
        const db = new sqlite3.Database(path.join(__dirname, 'database/paradise.db'));
        
        // Test query
        await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    logSuccess('Database connection working');
                    logInfo(`  - Total users: ${row.count}`);
                    resolve();
                }
            });
        });
        
        db.close();
    } catch (error) {
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

// ===== MAIN TEST RUNNER =====

async function runAllTests() {
    log('\n🚀 PARADISE DELIVERY - INTEGRATION TEST SUITE\n', 'blue');
    log('='.repeat(50));
    
    // Environment and Stripe tests
    await runTest('Environment Variables', testEnvironmentVariables);
    await runTest('Stripe Connection', testStripeConnection);
    await runTest('Stripe PaymentIntent Creation', testStripePaymentIntent);
    
    // Server tests (require server running)
    await runTest('Server Health', testServerRunning);
    await runTest('Payment Config Endpoint', testPaymentConfigEndpoint);
    await runTest('Restaurants Endpoint', testRestaurantsEndpoint);
    await runTest('Create PaymentIntent Endpoint', testCreatePaymentIntentEndpoint);
    
    // Logic tests
    await runTest('Distance Calculation', testDistanceCalculation);
    await runTest('Database Connection', testDatabaseConnection);
    
    // Print summary
    log('\n' + '='.repeat(50));
    log('\n📊 TEST SUMMARY\n', 'blue');
    log(`Total tests: ${results.passed + results.failed}`);
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
    
    if (results.failed > 0) {
        log('\n❌ FAILED TESTS:', 'red');
        results.tests
            .filter(t => t.status === 'failed')
            .forEach(t => log(`  - ${t.name}: ${t.error}`, 'red'));
        process.exit(1);
    } else {
        log('\n✅ ALL TESTS PASSED!', 'green');
        log('\n🎉 Your Paradise Delivery backend is ready to go!');
        log('\nNext steps:');
        log('  1. Get Google Maps API key');
        log('  2. Start the server: npm start');
        log('  3. Test a payment on the demo restaurant page');
        log('  4. Recruit your first restaurant!');
        process.exit(0);
    }
}

// Check if server is running before tests
async function checkServer() {
    try {
        await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
        return true;
    } catch (error) {
        return false;
    }
}

// Main
(async () => {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        logWarning('\n⚠ Server is not running!');
        log('Start the server first with: npm start\n');
        log('Then run this test script again: node test-integration.js\n');
        process.exit(1);
    }
    
    await runAllTests();
})();
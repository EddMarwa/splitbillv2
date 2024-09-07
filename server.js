const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Function to get M-Pesa access token
const getAccessToken = async () => {
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
};

// Test route to verify token generation
app.get('/access_token', async (req, res) => {
    try {
        const token = await getAccessToken();
        res.send({ token });
    } catch (error) {
        res.status(500).send('Error getting access token');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Function to initiate Lipa na M-Pesa Online (STK Push)
const lipaNaMpesaOnline = async (phoneNumber, amount) => {
    const token = await getAccessToken();
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const requestBody = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phoneNumber,
        "PartyB": shortcode,
        "PhoneNumber": phoneNumber,
        "CallBackURL": process.env.MPESA_CALLBACK_URL,
        "AccountReference": "BillSplitPayment",
        "TransactionDesc": "Bill split payment"
    };

    try {
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error initiating STK Push:', error.response.data);
        throw error;
    }
};

// Route to initiate payment prompts
app.post('/prompt-payment', async (req, res) => {
    const { phoneNumbers, amount } = req.body;

    try {
        const responses = await Promise.all(
            phoneNumbers.map((phoneNumber) => lipaNaMpesaOnline(phoneNumber, amount))
        );
        res.send({ success: true, responses });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Payment failed' });
    }
});

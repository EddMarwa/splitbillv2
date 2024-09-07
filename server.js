const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const base64 = require('base-64');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// M-Pesa credentials
const consumerKey = 'RmGjoXqvR1NlNzGp3Shk8Dn15EpdtGvkUyC1ekulW8gXfyhS';
const consumerSecret = 'Puo2dlPBHDjL8puvehLfHgl7JNT8zq9Xg9aGPnEWEEqLOeoBgDcuiPFxQH8EI20F';
const shortCode = '522533'; // Paybill/Till number
const passkey = ''; // For Lipa na M-Pesa Online
const lipaNaMpesaOnlineUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // Change URL for production

const generateToken = async () => {
    try {
        const tokenResponse = await axios({
            method: 'POST',
            url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', // Change URL for production
            headers: {
                'Authorization': `Basic ${base64.encode(`${consumerKey}:${consumerSecret}`)}`
            }
        });
        return tokenResponse.data.access_token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
};

// Route to initiate payment
app.post('/api/mpesa-prompt', async (req, res) => {
    const { phoneNumbers, amount } = req.body;
    try {
        const token = await generateToken();
        
        // Loop through phone numbers and send payment prompt
        const requests = phoneNumbers.map(phone => {
            return axios.post(lipaNaMpesaOnlineUrl, {
                BusinessShortCode: shortCode,
                Password: new Buffer.from(`${shortCode}${passkey}${new Date().toISOString().substring(0, 14)}`).toString('base64'),
                Timestamp: new Date().toISOString().substring(0, 14),
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phone,
                PartyB: shortCode,
                PhoneNumber: phone,
                CallBackURL: 'https://your-callback-url.com/callback', // Replace with your callback URL
                AccountReference: 'BillPayment',
                TransactionDesc: 'Payment for bill'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        });

        await Promise.all(requests);
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending payment prompts:', error);
        res.json({ success: false, error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//Callback Url
app.post('/callback', (req, res) => {
    const response = req.body;
    console.log('M-Pesa Callback Response:', response);

    // Process the callback response here (e.g., update database, notify user)
    
    res.status(200).send('Callback received');
});

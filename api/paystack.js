const axios = require('axios');

module.exports = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        "Authorization": "Bearer" + process.env.API_KEY,
        "Content-Type": "application/json"
    }
})
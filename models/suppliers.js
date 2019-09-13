const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    name: {
        type:  String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    bankCode: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    recipientId:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Suppliers', supplierSchema);
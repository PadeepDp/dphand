const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    item: { type: Object, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentType: { type: String, default: 'COD' },
    status: { type: String, default: 'order_place' }

}, { timestamps: true })

const order = new mongoose.model("order",Schema)

module.exports = order;


const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Customer'
    },
    total_amount: {
        type: String,
        default: null
    },
    f_name: {
        type: String,
        default: null
    },
    l_name: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    postal_code: {
        type: String,
        default: null
    },
    paymentMode: {
        type: String,
        default: null
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'completed', 'rejected', 'cancelled'],
        default: 'pending',
    },
    cart: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId, ref: 'Menu'
            },
            quantity: {
                type: Number,
                default: 0
            }
        }
    ]
}, {
    timestamps: true
});

//Export the model


module.exports = mongoose.model('Order', orderSchema);
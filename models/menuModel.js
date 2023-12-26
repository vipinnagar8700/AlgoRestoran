const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var menuSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory' },
    image: {
        type: String,
        default: null,
    },
    resturant_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Resturant'

    },
    tags: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true,
    },
    price: {
        type: String,
        default: 0
    }
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Menu', menuSchema);
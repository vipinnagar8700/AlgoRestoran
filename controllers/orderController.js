const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const { Customer, User } = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const OrderMake = asyncHandler(async (req, res) => {
    const userId = req.body.user_id;
    console.log(userId);

    try {
        const user = await Customer.findById(userId).populate('cart.product_id');
        console.log('User:', user);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false
            });
        }

        // Step 2: Retrieve user's cart items
        const cartItems = user.cart;

        // Get all product IDs from the user's cart
        const productIds = cartItems.map(cartItem => cartItem.product_id._id);

        // Step 3: Create an order document
        const order = new Order({
            user_id: userId,
            total_amount: calculateTotalAmount(cartItems),
            f_name: user.firstname,
            l_name: user.lastname,
            email: user.email,
            address: user.address,
            city: user.city,
            state: user.state,
            postal_code: user.pincode,
            paymentMode: req.body.paymentMode || null,
        });

        // Add cart items to the order
        order.cart = cartItems.map(cartItem => ({
            product_id: cartItem.product_id._id,
            quantity: cartItem.quantity,
        }));

        // Step 4: Save the order and update the user's cart
        await order.save();

        // Clear the user's cart
        user.cart = [];
        await user.save();

        // Step 5: Respond with success message and order details
        res.status(201).json({
            message: "Order Successfully placed!",
            success: true,
            productIds: productIds, // Include product IDs in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error creating order',
            success: false
        });
    }
});


function calculateTotalAmount(cartItems) {
    return cartItems.reduce((total, cartItem) => {
        return total + (cartItem.product_id.price * cartItem.quantity);
    }, 0).toString();
}



const allOrder = asyncHandler(async (req, res) => {

    try {
        const data = await Order.find();
        res.status(201).json({
            message: "Order Successfully placed!",
            success: true,
            data,
            length: data.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error creating order',
            success: false
        });
    }
})


const getOrder = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    console.log(userId)
    try {
        // Find orders based on the provided user_id and populate the 'cart.product_id' field
        const orders = await Order.find({ user_id: userId }).populate('cart.product_id');

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                message: 'No orders found for the user',
                success: false,
            });
        }

        res.status(200).json({
            message: 'Orders retrieved successfully',
            data: orders,
            success: true,
            length: orders.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error retrieving orders',
            success: false,
        });
    }
});



module.exports = {
    OrderMake, getOrder, allOrder
};

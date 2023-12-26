const { generateToken } = require('../config/JwtToken');
const Cart = require('../models/cartModel');
const asyncHandler = require('express-async-handler');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
require('dotenv/config')
const MenuCategory = require('../models/menuCategoryModel')



const addToCart = asyncHandler(async (req, res) => {
    const { product_id, user_id } = req.body;

    // Check if the product is already in the cart
    const existingCartItem = await Cart.findOne({ product_id, user_id });

    if (!existingCartItem) {
        // Product is not in the cart, add it
        const newCartItem = await Cart.create(req.body);
        res.status(201).json({
            message: "Product successfully added to the cart!",
            success: true,
            data: newCartItem
        });
    } else {
        // Product is already in the cart, remove it
        await Cart.findOneAndDelete({ product_id, user_id });
        res.status(200).json({
            message: "Product removed from the cart!",
            success: true,
        });
    }
});




 const Allcart = async (req, res) => {
    try {
        const patients = await Cart.find().populate('product_id') // Populate the product_id field with Menu details
            .populate('user_id').exec();; // Exclude the 'password' field;
        const length = patients.length;
        res.status(200).json([{
            message: "All cart data retrieved successfully!",
            data: patients,
            status: true,
            length
        }]);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            status: false
        });
    }
};


const editcart = async (req, res) => {
    const { id } = req.params;
    try {
        const editmenu = await Cart.findById(id); // Exclude the 'password' field
        if (!editmenu) {
            res.status(200).json({
                message: "menu was not found!",
            });
        } else {
            res.status(201).json({
                message: "Data successfully Retrieved!",
                success: true,
                data: editmenu
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve Data!",
            status: false
        });
    }
}
const Updatecart = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Assuming you send the updated data in the request body

    // Make sure to exclude the 'role' field from the updateData

    try {
        const editmenu = await Cart.findByIdAndUpdate(id, updateData, { new: true });

        if (!editmenu) {
            res.status(200).json({
                message: "menu was not found!",
            });
        } else {
            res.status(201).json({
                message: "Data successfully updated!",
                success: true,
                data: editmenu
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to update data!",
            status: false
        });
    }
}



const deleteCart = async (req, res) => {
    const { id } = req.params;
    try {
        const editmenu = await Cart.findByIdAndDelete(id); // Exclude the 'password' field
        if (!editmenu) {
            res.status(200).json({
                message: "menu was not found!",
            });
        } else {
            res.status(201).json({
                message: "Data successfully Deleted!",
                success: true,

            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to Deleted Data!",
            status: false
        });
    }
}

module.exports = {
    addToCart,
    Allcart, deleteCart
}
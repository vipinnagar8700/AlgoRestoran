const { generateToken } = require('../config/JwtToken');
const { User, Resturant, Customer } = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const Menu = require('../models/menuModel');
require('dotenv/config')



// Registration API
const register = asyncHandler(async (req, res) => {
    const { email, mobile, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

        if (!existingUser) {
            const newUser = await User.create({
                email,
                mobile,
                password,
                role,
            });
            console.log(newUser)
            // Add role-specific data based on the role

            let roleData;

            console.log(newUser.role, "this is role!");

            try {
                if (role === 'resturant') {
                    roleData = await Resturant.create({
                        user_id: newUser._id,
                        // Add the necessary fields for the Customer model here
                        password: newUser.password, // Assuming this is the password from newUser
                        mobile: newUser.mobile,
                        email: newUser.email,
                        role: newUser.role,
                    });
                } else if (role === 'customer') {
                    roleData = await Customer.create({
                        user_id: newUser._id,
                        // Add the necessary fields for the Customer model here
                        password: newUser.password, // Assuming this is the password from newUser
                        mobile: newUser.mobile,
                        email: newUser.email,
                        role: newUser.role,
                        // Add other required fields
                    });
                }

                console.log(roleData, "yy");
            } catch (error) {
                console.error("Error creating role-specific data:", error);
                // Handle the error as needed
            }


            res.status(201).json({
                message: "Successfully Registered!",
                success: true,
            });
        } else {
            const message =
                existingUser.email === email
                    ? "Email is already registered."
                    : "Mobile number is already registered.";
            res.status(409).json({
                message,
                success: false,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, mobile, password, role } = req.body;

    let findUser;

    // Check if a user with the given email or mobile exists and matches the role
    if (role) {
        findUser = await User.findOne({
            $and: [
                { $or: [{ email }, { mobile }] },
                { role }
            ]
        });
    } else {
        findUser = await User.findOne({
            $or: [
                { email },
                { mobile },
            ]
        });
    }

    if (findUser && (await findUser.isPasswordMatched(password))) {
        const ipAddress = req.ip; // Express automatically extracts the IP address from the request
        console.log(ipAddress, "IP ADDRESS!")

        // Generate tokens only when login is successful
        const token = generateToken(findUser._id);
        const refreshToken = generateRefreshToken(findUser._id);
        const updateUser = await User.findByIdAndUpdate(findUser._id, {
            refreshToken: refreshToken
        }, { new: true });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        findUser.loginHistory.push({ ipAddress });
        await findUser.save();

        const response = {
            _id: findUser._id,
            firstname: findUser.firstname,
            lastname: findUser.lastname,
            email: findUser.email,
            mobile: findUser.mobile,
            status: findUser.status,
            role: findUser.role,
            token: token,
        };

        if (findUser.role === 'resturant') {
            response.doctorData = await Resturant.findOne({ user: findUser._id });
        } else if (findUser.role === 'customer') {
            console.log(findUser, "aaa")
            response.patientData = await Customer.findOne({ user: findUser._id });
        }

        res.status(200).json({
            message: "Successfully Login!",
            data: response,
            user: response.patientData
        });
    } else {
        res.status(401).json({
            message: "Invalid Credentials!",
            success: false
        });
    }
});


// Add a product to the cart
const addToCart = asyncHandler(async (req, res) => {
    const { customerId, productId, quantity } = req.body;
    console.log(customerId, productId, quantity);

    try {
        // Check if the customer and product exist
        const customerData = await Customer.findById(customerId);

        console.log(customerData, "customer");
        const product = await Menu.findById(productId);
        console.log(product, "product");

        if (!customerData || !product) {
            return res.status(404).json({ error: 'Customer or product not found', "success": false });
        }

        // Check if the product is already in the cart
        const existingProductIndex = customerData.cart.findIndex(item => item.product_id.equals(product._id));

        if (existingProductIndex !== -1) {
            // If the product is already in the cart, remove it
            customerData.cart.splice(existingProductIndex, 1);
            res.json({ message: 'Product removed from the cart', "success": true });
        } else {
            // Add the product to the cart with the new quantity
            customerData.cart.push({ product_id: product._id, quantity: quantity || 1 });
            res.json({ message: 'Product added to the cart successfully', "success": true });
        }

        // Save the updated customer document
        await customerData.save();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', "success": false });
    }
});


const Allcart = async (req, res) => {
    const customerId = req.params.id;
    console.log(customerId, "customerId");
    try {
        // Check if the customer exists
        const customerData = await Customer.findById(customerId);

        if (!customerData) {
            return res.status(404).json({ error: 'Customer not found', "success": false });
        }

        // Get the cart from the customer data
        const cart = customerData.cart;

        // Fetch details for each product in the cart
        const cartWithProductDetails = await Promise.all(cart.map(async (cartItem) => {
            const productDetails = await Menu.findById(cartItem.product_id);
            const restaurantDetails = await Resturant.findById(productDetails.resturant_id);

            return {
                ...cartItem.toObject(),
                productDetails: productDetails.toObject(),
                restaurantDetails: restaurantDetails.toObject()
            };
        }));
        const length = cartWithProductDetails.length;
        res.json({ cart: cartWithProductDetails, "success": true, length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', "success": false });
    }
};



const Deletecart = async (req, res) => {
    const cartId = req.params.id;
    console.log(cartId)
    try {
        // Find the customer with the cart containing the product
        const customerData = await Customer.findOne({ 'cart._id': cartId });

        if (!customerData) {
            return res.status(404).json({ error: 'Cart not found', "success": false });
        }

        // Get the cart from the customer data
        const cart = customerData.cart;
        console.log(cart, "888")
        // Find the index of the product in the cart
        const productIndex = cart.findIndex(item => item._id.toString() === cartId);
        console.log(productIndex, "0099")
        // If the product is not found in the cart
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in the cart', "success": false });
        }

        // Remove the product from the cart
        cart.splice(productIndex, 1);

        // Save the updated cart to the customer data
        customerData.cart = cart;
        await customerData.save();

        res.json({ message: 'Product deleted from the cart', "success": true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', "success": false });
    }
};

const UpdateCart = async (req, res) => {
    const cartId = req.params.id;
    console.log(cartId)
    const { newQuantity } = req.body; // Assuming the new quantity is provided in the request body
    console.log(newQuantity)
    try {
        // Find the customer with the cart containing the product
        const customerData = await Customer.findOne({ 'cart._id': cartId });

        if (!customerData) {
            return res.status(404).json({ error: 'Cart not found', "success": false });
        }

        // Get the cart from the customer data
        const cart = customerData.cart;

        // Find the index of the product in the cart
        const productIndex = cart.findIndex(item => item._id.toString() === cartId);

        // If the product is not found in the cart
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in the cart', "success": false });
        }

        // Update the quantity of the product in the cart
        cart[productIndex].quantity = newQuantity;

        // Save the updated cart to the customer data
        customerData.cart = cart;
        await customerData.save();

        res.json({ message: 'Quantity updated in the cart', "success": true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', "success": false });
    }
};

const AllUsers = async (req, res) => {
    try {
        const patients = await User.find({ role: 'customer' }).select('-password'); // Exclude the 'password' field;
        const length = patients.length;
        res.status(200).json([{
            message: "All Users data retrieved successfully!",
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


const editUser = async (req, res) => {
    const { id } = req.params;
    console.log(id, "id")
    try {
        const editUser = await Customer.findById(id).select('-password');
        console.log(editUser, "editUser")
        if (!editUser) {
            res.status(200).json({
                message: "User was not found!",
            });
            return;
        } else {
            res.status(201).json({
                message: "Data successfully Retrieved!",
                success: true,
                data: editUser
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve Data!",
            status: false
        });
    }
}


const editUserbytoken = asyncHandler(async (req, res) => {
    try {
        const token = req.params.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: Token not provided",
                status: false
            });
        }

        try {
            const jwtSec = "mySecret";

            const decodedToken = jwt.verify(token, jwtSec, { algorithm: 'HS256' });

            const userId = decodedToken.userId;

            const editUser = await Customer.findOne({ user_id: userId }).select('-password');

            if (!editUser) {
                return res.status(404).json({
                    message: "User not found!",
                    status: false
                });

            } else {
                console.log("User Data:", editUser);
                return res.status(200).json({
                    message: "Data successfully retrieved!",
                    success: true,
                    data: editUser
                });
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            return res.status(401).json({
                message: "Unauthorized: Invalid token",
                status: false
            });
        }
    } catch (error) {
        console.error("Error in editUserbytoken:", error);
        return res.status(500).json({
            message: "Failed to retrieve data!",
            status: false
        });
    }
});



const UpdateUsers = async (req, res) => {
    const { id } = req.params;

    const updateData = req.body; // Assuming you send the updated data in the request body

    delete updateData.role;

    try {
        const editUser = await Customer.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

        if (!editUser) {
            res.status(200).json({
                message: "User was not found!",
            });
        } else {
            res.status(201).json({
                message: "Data successfully updated!",
                success: true,
                data: editUser
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to update data!",
            status: false
        });
    }
}


const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(200).json({
                message: "User was not found!",
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                message: "Admin users cannot be deleted.",
                status: false,
            });
        }

        // If the user is not an admin, proceed with the deletion
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(200).json({
                message: "User was not found!",
            });
        } else {
            return res.status(201).json({
                message: "Data successfully deleted!",
                success: true,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete data!",
            status: false,
        });
    }
}


const Accept_User = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check if the user making the request is an admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: "You don't have permission to perform this action",
            success: false
        });
    }

    try {
        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Update the user's permission to true
        user.permission = true;
        await user.save();

        res.status(200).json({
            message: "Permission Granted successfully!",
            success: true,
            data: { userId, permission: true }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
});


module.exports = {
    register,
    login, AllUsers, Deletecart, Allcart, editUser, UpdateUsers, deleteUser, Accept_User, addToCart, UpdateCart, editUserbytoken
}
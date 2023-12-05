const { generateToken } = require('../config/JwtToken');
const { User, Resturant, Customer } = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
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
                if (newUser.role === 'resturant') {
                    roleData = await Resturant.create({
                        user: newUser,
                        // Add the necessary fields for the Customer model here
                        password: newUser.password, // Assuming this is the password from newUser
                        mobile: newUser.mobile,
                        email: newUser.email,
                        role: newUser.role,
                    });
                } else if (newUser.role === 'customer') {
                    roleData = await Customer.create({
                        user: newUser,
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
                message: 'Successfully Registered!',
                success: true,
            });
        } else {
            const message =
                existingUser.email === email
                    ? 'Email is already registered.'
                    : 'Mobile number is already registered.';
            res.status(409).json({
                message,
                success: false,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error',
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
        // if (!findUser.permission) {
        //     return res.status(401).json({
        //         message: "You don't have permission to login",
        //         success: false
        //     });
        // } else {
        const token = generateToken(findUser._id);
        const refreshToken = generateRefreshToken(findUser._id);
        const updateUser = await User.findByIdAndUpdate(findUser._id, {
            refreshToken: refreshToken
        }, { new: true }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        // }

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
            response.patientData = await Customer.findOne({ user: findUser._id });
        }

        res.status(200).json({
            message: "Successfully Login!",
            data: response,
        });
    } else {
        res.status(401).json({
            message: "Invalid Credentials!",
            success: false
        });
    }
});



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

// const AllDoctors = async (req, res) => {
//     try {
//         const doctor = await User.find({ role: 'doctor' }).select('-password'); // Exclude the 'password' field;
//         const length = doctor.length;
//         res.status(200).json([{
//             message: "All doctor data retrieved successfully!",
//             data: doctor,
//             status: true,
//             length
//         }]);
//     } catch (error) {
//         res.status(500).json({
//             message: "Internal Server Error",
//             error: error.message,
//             status: false
//         });
//     }
// };
// const Allpharmacy = async (req, res) => {
//     try {
//         const pharmacy = await User.find({ role: 'pharmacy' }).select('-password'); // Exclude the 'password' field;
//         const length = pharmacy.length;
//         res.status(200).json([{
//             message: "All pharmacy data retrieved successfully!",
//             data: pharmacy,
//             status: true,
//             length
//         }]);
//     } catch (error) {
//         res.status(500).json({
//             message: "Internal Server Error",
//             error: error.message,
//             status: false
//         });
//     }
// };

const editUser = async (req, res) => {
    const { id } = req.params;
    try {
        const editUser = await User.findById(id).select('-password'); // Exclude the 'password' field
        if (!editUser) {
            res.status(200).json({
                message: "User was not found!",
            });
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
const UpdateUsers = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Assuming you send the updated data in the request body

    delete updateData.role;

    try {
        const editUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

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
    login, AllUsers, editUser, UpdateUsers, deleteUser, Accept_User
}
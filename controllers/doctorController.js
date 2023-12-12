const { generateToken } = require('../config/JwtToken');
const { Resturant } = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
require('dotenv/config')


const AllResturants = async (req, res) => {
    try {
        const Resturantss = await Resturant.find().select('-password'); // Exclude the 'password' field;
        const length = Resturantss.length;
        res.status(200).json([{
            message: "All Resturant data retrieved successfully!",
            data: Resturantss,
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

const editResturant = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const Resturantss = await Resturant.findById(id).select('-password');
        console.log(Resturantss)// Exclude the 'password' field
        if (!Resturantss) {
            res.status(404).json({  // Correct the status code to 404 (Not Found)
                message: "Resturant was not found!",
                success: false,
            });
        } else {
            res.status(200).json({  // Correct the status code to 200 (OK)
                message: "Data successfully Retrieved!",
                success: true,
                data: Resturantss
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve Data!",
            success: false,  // Correct the key to 'success'
        });
    }
}

const UpdateResturant = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Assuming you send the updated data in the request body

    // Make sure to exclude the 'role' field from the updateData
    delete updateData.role;

    try {
        const editResturant = await Resturant.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

        if (!editResturant) {
            res.status(200).json({
                message: "Resturant was not found!",
            });
        } else {
            res.status(201).json({
                message: "Data successfully updated!",
                success: true,
                data: editResturant
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to update data!",
            status: false
        });
    }
}
const UpdateResturantSocail_Media = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Assuming you send the updated data in the request body

    // Create an object with only the social media fields you want to update
    const socialMediaUpdates = {
        fb_Url: updateData.fb_Url || null,
        Twitter_Url: updateData.Twitter_Url || null,
        Instagram_Url: updateData.Instagram_Url || null,
        Pinterest_url: updateData.Pinterest_url || null,
        Linked_In_Url: updateData.Linked_In_Url || null,
        YouTube_Url: updateData.YouTube_Url || null,
    };

    // Make sure to exclude the 'role' field from the updateData

    try {
        const editResturant = await Resturant.findByIdAndUpdate(id, socialMediaUpdates, { new: true });

        if (!editResturant) {
            res.status(200).json({
                message: "Resturant was not found!",
            });
        } else {
            res.status(201).json({
                message: "Social media data successfully updated!",
                success: true,
                data: editResturant
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to update social media data!",
            status: false
        });
    }
}
const UpdateResturantBankDetails = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Assuming you send the updated data in the request body

    // Create an object with only the social media fields you want to update
    const socialMediaUpdates = {
        BankName: updateData.BankName || null,
        BranchName: updateData.BranchName || null,
        Account_Number: updateData.Account_Number || null,
        AccountName: updateData.AccountName || null,

    };

    // Make sure to exclude the 'role' field from the updateData

    try {
        const editResturant = await Resturant.findByIdAndUpdate(id, socialMediaUpdates, { new: true });

        if (!editResturant) {
            res.status(200).json({
                message: "Resturant was not found!",
            });
        } else {
            res.status(201).json({
                message: "Bank Account  data successfully updated!",
                success: true,
                data: editResturant
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to update Bank Account  data !",
            status: false
        });
    }
}

const deleteResturant = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the Resturant by ID
        const Resturant = await Resturant.findById(id);

        if (!Resturant) {
            return res.status(200).json({
                message: "Resturant was not found!",
            });
        }

        if (Resturant.role === "admin") {
            return res.status(403).json({
                message: "Admin Resturant cannot be deleted.",
                status: false,
            });
        }

        // If the Resturant is not an admin, proceed with the deletion
        const deletedResturant = await Resturant.findByIdAndDelete(id);

        if (!deletedResturant) {
            return res.status(200).json({
                message: "Resturant was not found!",
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

module.exports = {
    AllResturants, editResturant, UpdateResturant, deleteResturant, UpdateResturantSocail_Media, UpdateResturantBankDetails
}
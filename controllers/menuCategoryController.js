const { generateToken } = require('../config/JwtToken');
const Menu = require('../models/menuModel');
const asyncHandler = require('express-async-handler');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
require('dotenv/config')
const MenuCategory = require('../models/menuCategoryModel')

const Addmenus = asyncHandler(async (req, res) => {
    const { title, content, category_id, resturant_id, tags } = req.body;

    // Check if a menu with the given email or phone already exists
    const existingmenu = await Menu.findOne({
        $or: [
            { title }
        ]
    });

    if (!existingmenu) {
        // menu does not exist, so create a new menu
        const newmenu = await Menu.create(req.body);
        res.status(201).json({
            message: "menu Successfully Created!",
            success: true,
            data: newmenu
        });
    } else {
        // menu with the same email or phone already exists
        const message = existingmenu.title === title
            ? "title is already exists."
            : "title is already exists.";
        res.status(409).json({
            message,
            success: false
        });
    }
});





const Allmenus = async (req, res) => {
    try {
        const patients = await Menu.find(); // Exclude the 'password' field;
        const length = patients.length;
        res.status(200).json([{
            message: "All menus data retrieved successfully!",
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


const editmenu = async (req, res) => {
    const { id } = req.params;
    try {
        const editmenu = await Menu.findById(id); // Exclude the 'password' field
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
const Updatemenus = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Assuming you send the updated data in the request body

    // Make sure to exclude the 'role' field from the updateData

    try {
        const editmenu = await Menu.findByIdAndUpdate(id, updateData, { new: true });

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

const AddmenusCategory = asyncHandler(async (req, res) => {
    const { title, } = req.body;

    // Check if a menu with the given email or phone already exists
    const existingmenu = await MenuCategory.findOne({
        $or: [
            { title }
        ]
    });

    if (!existingmenu) {
        // menu does not exist, so create a new menu
        const newmenu = await MenuCategory.create(req.body);
        res.status(201).json({
            message: "menu Category Successfully Created!",
            success: true,
            data: newmenu
        });
    } else {
        // menu with the same email or phone already exists
        const message = existingmenu.title === title
            ? "title is already exists."
            : "title is already exists.";
        res.status(409).json({
            message,
            success: false
        });
    }
});

const AllCategory = async (req, res) => {
    try {
        const patients = await MenuCategory.find(); // Exclude the 'password' field;
        const length = patients.length;
        res.status(200).json([{
            message: "All menus Category data retrieved successfully!",
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

const deletemenuCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const editmenu = await MenuCategory.findByIdAndDelete(id); // Exclude the 'password' field
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


const deletemenu = async (req, res) => {
    const { id } = req.params;
    try {
        const editmenu = await Menu.findByIdAndDelete(id); // Exclude the 'password' field
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
    Addmenus,
    Allmenus, editmenu, Updatemenus, AddmenusCategory, AllCategory, deletemenuCategory, deletemenu
}
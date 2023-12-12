const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    // Common user fields
    firstname: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['resturant', 'customer', 'admin'],
        required: true,
    },
    loginHistory: [
        {
            ipAddress: String,
            loginTime: { type: Date, default: Date.now },
        },
    ],
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex');
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    return resettoken;
};

const User = mongoose.model('User', userSchema);

const resturantSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // resturant-specific fields
    firstname: String,
    lastname: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    address: String,
    city: String,
    state: String,
    image: {
        type: String,
        default: null,
    },
    gender: {
        type: String,
        default: null
    },

    Pincode: {
        type: String,
        default: null
    },
    verified_Certification: {
        type: String,
        default: null
    },
    resturant_photos: {
        type: String,
        default: null
    },
    resturant_address: {
        type: String,
        default: null
    },

    resturant_city: {
        type: String,
        default: null
    }, resturant_state: {
        type: String,
        default: null
    }, fb_Url: {
        type: String,
        default: null
    }, Twitter_Url: {
        type: String,
        default: null
    }, Instagram_Url: {
        type: String,
        default: null
    }, Pinterest_url: {
        type: String,
        default: null
    }, Linked_In_Url: {
        type: String,
        default: null
    },
    YouTube_Url: {
        type: String,
        default: null
    }, dob: {
        type: String,
        default: null
    }, Resturnat_name: {
        type: String,
        default: null
    }, About: {
        type: String,
        default: null
    },
    Timming: {
        type: String,
        default: null

    },
    Offers: {
        type: String,
        default: null
    },
    Rating: {
        type: String,
        default: null
    },
    Comments: {
        type: String,
        default: null
    }, Dislikes: {
        type: String,
        default: null
    },
    Likes: {
        type: String,
        default: null
    },
    Resturant_helpline_no: {
        type: String,
        default: null
    }

    , experience: {
        type: String,
        default: null
    }, chef: {
        type: String,
        default: null
    },
    permission: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

const customerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // customers-specific fields
    firstname: String,
    lastname: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    address: String,
    city: String,
    state: String,
    pincode:String,
    image: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    cart: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
        quantity: { type: Number, default: 1 },
    }],

    age: {
        type: String,
        default: null
    }
    ,
    permission: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});



const Resturant = mongoose.model('Resturant', resturantSchema);
const Customer = mongoose.model('Customer', customerSchema);

module.exports = { User, Resturant, Customer };

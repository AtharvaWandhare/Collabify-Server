import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserProfile } from './userProfile.model.js';
import UserNotifications from './userNotifications.model.js';
import UserSettings from './userSettings.model.js';

const userSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
        },
        name: {
            type: String,
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            minlength: 3,
            maxlength: 45,
            index: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            trim: true,
            minlength: 8,
        },
        lastLogin: {
            type: Date
        },
        active: {
            type: Boolean,
            default: false,
        },
        avatar: {
            type: String,
            default: ""
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.lastLoginUpdate = async function () {
    this.lastLogin = Date.now();
    this.active = true;
    await this.save();
}

userSchema.methods.StatusUpdate = async function (status) {
    this.active = status;
    await this.save();
}

userSchema.methods.setAvatar = async function (avatar) {
    this.avatar = avatar;
    await this.save();
}

userSchema.methods.removeAvatar = async function () {
    this.avatar = "";
    await this.save();
}

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

userSchema.methods.generateAuthToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    } catch (error) {
        throw new Error('Error generating auth token');
    }
};

userSchema.methods.generateRefreshToken = function () {
    try {
        return jwt.sign(
            { _id: this._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );
    } catch (error) {
        throw new Error('Error generating refresh token');
    }
};

userSchema.pre('findOneAndDelete', async function (next) {
    const userId = this.getQuery()["_id"];
    try {
        await UserProfile.findOneAndDelete({ user: userId });
        await UserNotifications.findOneAndDelete({ user: userId });
        await UserSettings.findOneAndDelete({ user: userId });
    } catch (error) {
        console.log(error);
        next(error);
    }
    next();
})

export const User = mongoose.model('User', userSchema);
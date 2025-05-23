import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    location: {
        type: String,
        trim: true,
        maxlength: 45,
    },
    website: {
        type: String,
        trim: true,
        maxlength: 45,
    },
    birthday: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    }
}, { timestamps: true });

userProfileSchema.methods.toJSON = function () {
    const userProfile = this;
    const userProfileObject = userProfile.toObject();

    delete userProfileObject.__v;

    return userProfileObject;
}

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
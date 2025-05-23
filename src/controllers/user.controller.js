import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { UserProfile } from "../models/userProfile.model.js";
import userNotifications from "../models/userNotifications.model.js";
import userSettings from "../models/userSettings.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const userController = {

    generateAuthAndRefreshToken: async (userId) => {
        try {
            const user = await User.findById(userId);
            const AuthToken = user.generateAuthToken();
            const RefreshToken = user.generateRefreshToken();
            // console.log(`AuthToken: ${AuthToken}\nRefreshToken: ${RefreshToken}`);

            user.refreshToken = RefreshToken;
            await user.save({ validateBeforeSave: false });

            return { AuthToken, RefreshToken };
        } catch (error) {
            throw new Error(error);
        }
    },

    getAllUsers: asyncHandler(async (req, res) => {
        const users = await User.find();
        if (!users) {
            return res.status(200).json(200, {}, 'No Users Found!!');
        }

        const response = res.status(200).json(new ApiResponse(200, users, "All users fetched successfully"));
        console.log('All users fetched successfully!!!');
        return response;
    }),

    // Register a new user
    register: asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        console.log(`username: ${username}\nemail: ${email}\npassword: ${password}`);

        if (!email && !password) {
            throw new ApiError(400, "Email and Password are required");
        }

        if (!username || username.trim() === '') {
            throw new ApiError(402, "Username is required");
        }

        if (!email || email.trim() === '') {
            throw new ApiError(402, "Email is required");
        }

        if (!password || password.trim() === '') {
            throw new ApiError(403, "Password is required");
        }

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (userExists) {
            throw new ApiError(400, "User already exists");
        }

        // Create new user
        const user = await User.create({ username, email, password });
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while creating user!!!");
        }

        // Create Empty User Profile
        await UserProfile.create({ user: createdUser });
        await userNotifications.create({ user: createdUser });
        await userSettings.create({ user: createdUser });

        // Send response
        const response = res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
        console.log('User Registered successfully!!');
        return response;
    }),

    // Login user
    login: asyncHandler(async (req, res) => {
        const { email, username, password } = req.body;
        // console.log(`email: ${email}\nusername: ${username}\npassword: ${password}`);

        if ([email, username].every((field => field === undefined || field.trim() === ''))) {
            throw new ApiError(401, "Username or Email is required");
        }

        if (!password || password.trim() === '') {
            throw new ApiError(402, "Password is required");
        }

        // Check if user exists
        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (!user) {
            throw new ApiError(404, "No User exists with this email or username!!!");
        }

        // Check if password is correct
        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) {
            throw new ApiError(400, "Invalid Password!!!");
        }

        // Generate token
        const { AuthToken, RefreshToken } = await userController.generateAuthAndRefreshToken(user._id);
        const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        }

        // Send response
        const response = res
            .status(200)
            .cookie('AuthToken', AuthToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: LoggedInUser,
                        AuthToken
                    },
                    "User logged in successfully"
                )
            )

        user.lastLoginUpdate();
        // user.StatusUpdate(true);

        console.log('User logged in successfully!!!');
        return response;
    }),

    // Logout user
    logout: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json(new ApiResponse(404, {}, "User not found!!!"));
            return;
        }
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: { refreshToken: 1 }
            },
            { new: true }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        const response = res
            .status(200)
            .clearCookie('AuthToken', options)
            .json(new ApiResponse(200, {}, "User logged out successfully"));

        user.StatusUpdate(false);
        console.log('User logged out successfully!!!');
        return response;
    }),

    // Get user profile
    getProfile: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(404, "User not found!!!");
        }

        const response = res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
        console.log('User profile fetched successfully!!!');
        return response;
    }),

    // Update user profile
    updateProfile: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found!!!");
        }

        const { username, email } = req.body;
        if ([username, email].includes('')) {
            throw new ApiError(400, "All fields are required");
        }

        user.username = username || user.username;
        user.email = email || user.email;

        await user.save();
        const updatedUser = await User.findById(user._id).select("-password -refreshToken");

        const response = res.status(200).json(new ApiResponse(200, updatedUser, "User profile updated successfully"));
        console.log('User profile updated successfully!!!');
        return response;
    }),

    // Delete user
    deleteUser: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found!!!");
        }

        await User.findOneAndDelete({ _id: req.user._id });
        const response = res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
        console.log('User deleted successfully!!!');
        return response;
    }),

    // Get user by ID
    getUserById: asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(404, "User not found!!!");
        }

        const response = res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
        console.log('User fetched successfully!!!');
        return response;
    }),

    changePassword: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found!!!");
        }

        const { oldPassword, newPassword } = req.body;
        if ([oldPassword, newPassword].includes('')) {
            throw new ApiError(400, "All fields are required");
        }

        const isMatch = await user.isPasswordCorrect(oldPassword);
        if (!isMatch) {
            throw new ApiError(400, "Invalid Old Password!!!");
        }

        user.password = newPassword;
        await user.save();

        const response = res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
        console.log('Password changed successfully!!!');
        return response;
    }),

    // Change User Profile Picture
    changeProfilePicture: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found!!!");
        }

        const profilePicturePath = req.file.path;
        // console.log(`profilePicturePath: ${profilePicturePath}`);
        if (!profilePicturePath) {
            throw new ApiError(400, "Profile Picture is required");
        }

        const profilePicture = await uploadOnCloudinary(profilePicturePath);
        if (!profilePicture) {
            throw new ApiError(500, "Something went wrong while uploading profile picture on cloudinary!");
        }
        if (user.profilePicture !== "") {
            await deleteFromCloudinary(user.profilePicture);
            await user.removeProfilePicture();
        }
        await user.setProfilePicture(profilePicture.url);
        const updatedUser = await User.findById(user._id).select("-password -refreshToken");

        const response = res.status(200).json(new ApiResponse(200, updatedUser, "Profile Picture changed successfully"));
        console.log('Profile Picture changed successfully!!!');
        return response;
    }),

    removeProfilePicture: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found!!!");
        }
        if (!user.profilePicture) {
            throw new ApiError(400, "Profile Picture not found!!!");
        }
        await deleteFromCloudinary(user.profilePicture);
        user.removeProfilePicture();
        const updatedUser = await User.findById(user._id).select("-password -refreshToken");

        const response = res.status(200).json(new ApiResponse(200, updatedUser, "Profile Picture removed successfully"));
        console.log('Profile Picture removed successfully!!!');
        return response;
    }),

    // Refresh Token
    refreshAuthToken: asyncHandler(async (req, res) => {
        const incomingRefreshToken = req.cookies.RefreshToken || req.body.RefreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        try {
            const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decoded._id);
            if (!user) {
                throw new ApiError(404, "User not found!!! Invalid Refresh Token");
            }

            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh Token is expired or Used!");
            }

            const { newAuthToken, newRefreshToken } = await userController.generateAuthAndRefreshToken(user._id);
            const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");

            const options = {
                httpOnly: true,
                secure: true
            }

            const response = res
                .status(200)
                .cookie('AuthToken', newAuthToken, options)
                .cookie('RefreshToken', newRefreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {
                            user: LoggedInUser,
                            AuthToken: newAuthToken,
                            RefreshToken: newRefreshToken
                        },
                        "Token refreshed successfully"
                    )
                );

            console.log('Token refreshed successfully!!!');
            return response;
        } catch (error) {
            throw new ApiError(401, error?.message || "Something went wrong while refreshing token!!!");
        }
    })

};

export default userController;
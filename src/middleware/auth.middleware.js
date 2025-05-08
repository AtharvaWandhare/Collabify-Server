import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // console.log('Req', req);
        const token = req.body?.headers?.Authorization?.replace('Bearer ', '') || req.authorization?.replace('Bearer ', '') || req.headers?.authorization?.replace('Bearer ', '') || req.cookies?.AuthToken || req.cookies?.access_token || req.headers?.['x-access-token'] || req.headers?.['authorization'] || req.headers?.['Authorization'];
        if (!token) {
            throw new ApiError(401, 'Unauthorized Access');
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid Auth Token');
        }

        req.user = user;
        console.log('JWT Successfully verified');
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid Access Token');
    }
});

export { verifyJWT };
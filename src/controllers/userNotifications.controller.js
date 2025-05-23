import { asyncHandler } from "../utils/asyncHandler.js";
import UserNotifications from "../models/userNotifications.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const userNotificationsController = {
    getNotifications: asyncHandler(async (req, res, next) => {
        const userNotifications = await UserNotifications.findOne({ user: req.user._id });
        if (!userNotifications) {
            return next(ApiError.notFound('No Notifications Found'));
        }
        return res.status(200).json(new ApiResponse(200, userNotifications, 'All User Notifications and Settings Fetched'));
    }),

    updateNotificationsSettings: asyncHandler(async (req, res, next) => {
        const { emailNotifications, pushNotifications, notificationMessages } = req.body;
        // if ([emailNotifications, pushNotifications, notificationMessages].every(setting => setting !== (true || false))) {
        //     throw ApiError(400, 'Invalid Notification Settings');
        // }
        if ([emailNotifications, pushNotifications, notificationMessages].some(setting => typeof setting !== 'boolean')) {
            throw new ApiError(400, 'Invalid Notification Settings');
        }
        const userNotifications = await UserNotifications.findOne({ user: req.user._id });
        if (!userNotifications) {
            return next(new ApiError(404, 'User Notifications not found'));
        }
        if (emailNotifications === true) userNotifications.method.emailNotificationsOn()
        else userNotifications.method.emailNotificationsOff();
        if (pushNotifications === true) userNotifications.method.pushNotificationsOn()
        else userNotifications.method.pushNotificationsOff();
        if (notificationMessages === true) userNotifications.method.notificationMessagesOn()
        else userNotifications.method.notificationMessagesOff();

        console.log('Updated Notification Settings:', { emailNotifications, pushNotifications, notificationMessages });

        await userNotifications.save();
        return res.status(200).json(new ApiResponse(200, userNotifications, 'Notifications Settings Updated'));
    }),

    createNotification: asyncHandler(async (req, res, next) => {
        const { message, link } = req.body;

        // Validate input
        if (!message || !link) {
            throw new ApiError(400, 'Message and link are required');
        }

        const userNotifications = await UserNotifications.findOne({ user: req.user._id });

        const notificationId = 'dbs-' + req.user.username.filter((_, i) => i < 4) + Date.now() + Math.floor(Math.random() * 1000);

        if (!userNotifications) {
            return next(new ApiError(404, 'User Notifications not found'));
        }

        userNotifications.notifications.push({ notificationId, message, link });
        userNotifications.totalNotifications = userNotifications.notifications.length + 1;
        await userNotifications.save();

        return res.status(201).json(new ApiResponse(201, userNotifications, 'Notification Created'));
    }),
};

export default userNotificationsController;
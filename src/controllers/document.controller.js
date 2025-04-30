import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { UserProfile } from "../models/userProfile.model.js";
import userNotifications from "../models/userNotifications.model.js";
import userSettings from "../models/userSettings.model.js";


const documentController = {
    getAllDocuments: asyncHandler(async (req, res) => {

    }),

    createDocument: asyncHandler(async (req, res) => {

    }),

    getDocumentById: asyncHandler(async (req, res) => {

    }),

    updateDocument: asyncHandler(async (req, res) => {

    }),

    deleteDocument: asyncHandler(async (req, res) => {

    }),

    searchDocuments: asyncHandler(async (req, res) => {

    })
}

export default documentController;
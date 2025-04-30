import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { UserProfile } from "../models/userProfile.model.js";
import userNotifications from "../models/userNotifications.model.js";
import userSettings from "../models/userSettings.model.js";
import Document from "../models/document.model.js";


const documentController = {
    getAllDocuments: asyncHandler(async (req, res) => {

    }),

    createDocument: asyncHandler(async (req, res) => {
        const { title, content } = req.body;
        const userId = req.user._id;
        console.log(userId, title, content);

        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required!' });
        }

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Content is required!' });
        }

        const newDocument = {
            user: userId,
            title,
            content,
        };

        const document = await Document.create(newDocument);
        const createdDocument = await Document.findById(document._id);
        if (!createdDocument) {
            return res.status(500).json({ message: 'Failed to create document!' });
        }

        const response = res.status(201).json({ message: 'Document created successfully!', document: createdDocument });
        console.log('Document created successfully!');
        return response;
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
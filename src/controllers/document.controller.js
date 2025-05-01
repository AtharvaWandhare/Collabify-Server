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
        const userId = req.user._id;
        const documents = await Document.find({ user: userId }).sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, documents, 'Documents fetched successfully!'));
    }),

    createDocument: asyncHandler(async (req, res) => {
        const { title, content } = req.body;
        const userId = req.user._id;
        console.log(userId, title, content);

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
        const { id } = req.params;
        const userId = req.user._id;

        const document = await Document.findOne({ _id: id, user: userId });
        if (!document) {
            return res.status(404).json(new ApiError(404, 'Document not found!'));
        }

        return res.status(200).json(new ApiResponse(200, document, 'Document fetched successfully!'));
    }),

    updateDocument: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user._id;

        const document = await Document.findOneAndUpdate(
            { _id: id, user: userId },
            { title, content },
            { new: true }
        );

        if (!document) {
            return res.status(404).json(new ApiError(404, 'Document not found!'));
        }
        console.log('Document updated successfully!');
        return res.status(200).json(new ApiResponse(200, document, 'Document updated successfully!'));
    }),

    deleteDocument: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user._id;

        await Document.findOneAndDelete({ _id: id, user: userId });

        return res.status(200).json(new ApiResponse(200, {}, 'Document deleted successfully!'));
    }),

    searchDocuments: asyncHandler(async (req, res) => {

    })
}

export default documentController;
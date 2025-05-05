import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { UserProfile } from "../models/userProfile.model.js";
import userNotifications from "../models/userNotifications.model.js";
import userSettings from "../models/userSettings.model.js";
import Document from "../models/document.model.js";
import HtmlToDocx from 'html-to-docx';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    }),

    downloadDocumentAsDOCX: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const username = req.user.username;

            const document = await Document.findOne({ _id: id, user: userId });
            if (!document) {
                return res.status(404).json(new ApiError(404, 'Document not found!'));
            }

            const Delta = JSON.parse(document.content);
            const QuillDeltaToHtmlConverter = (await import('quill-delta-to-html')).QuillDeltaToHtmlConverter;
            const converter = new QuillDeltaToHtmlConverter(Delta.ops, {});
            const htmlContent = converter.convert();

            const documentOptions = {
                orientation: 'portrait',
                pageSize: 'A4',
                title: document.title,
                creator: username,
                font: 'Georgia',
            }

            const buffer = await HtmlToDocx(htmlContent, null, documentOptions, null);

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${document.title}.docx"`);

            // Send the buffer directly
            return res.send(buffer);

        } catch (error) {
            console.error('Error generating DOCX:', error);
            return res.status(500).json(new ApiError(500, 'Failed to generate document!'));
        }
    }),

    getDocumentCollaborators: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user._id;

        const document = Document.findOne({ _id: id, user: userId });
        if (!document) {
            return res.status(401).json(new ApiError(401, 'There was an error fetching the document! Please try again!'));
        }

        const collaborators = await User.find({ _id: { $in: document.collaborators } });
        if (!collaborators) {
            return res.status(402).json(new ApiError(402, 'There was an error fetching the collaborators! Please try again!'));
        }
        console.log('Collaborators fetched:', collaborators);

        return res.status(200).json(new ApiResponse(200, collaborators, 'Collaborators fetched successfully!'));
    }),

    addDocumentCollaborator: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user._id;
        const { emails } = req.body;

        const document = await Document.findOne({ _id: id, user: userId });
        if (!document) {
            return res.status(401).json(new ApiError(401, 'There was an error fetching the document! Please try again!'));
        }

        const collaborators = await User.find({ email: { $in: emails } }).select('_id email username');
        if (!collaborators) {
            return res.status(402).json(new ApiError(402, 'There was an error fetching the collaborators! Please try again!'));
        }

        console.log('\nCollaborators fetched:', collaborators);
        console.log('\nCollaborators to be added:', document.collaborators);
        document.collaborators = [
            ...document.collaborators,
            ...collaborators.map((collaborator) => ({
                user: collaborator._id,
                email: collaborator.email,
                username: collaborator.username || '',
            }))
        ];
        console.log('\nCollaborators to be added:', document.collaborators);
        document.collaborators = [...new Set(document.collaborators)];
        await document.save();
        console.log('\nCollaborators added:', document.collaborators);

        const updatedCollaborators = await User.find({ _id: { $in: document.collaborators } });
        console.log('Collaborators updates successfully:');
        return res.status(200).json(new ApiResponse(200, updatedCollaborators, 'Collaborators added successfully!'));
    }),

    removeDocumentCollaborator: asyncHandler(async (req, res) => {

    }),
}

export default documentController;
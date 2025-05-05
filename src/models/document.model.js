import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        trim: true,
        required: false,
        default: 'Untitled Document',
    },
    content: {
        type: String,
        trim: true,
        required: false,
        default: '',
    },
    collaborators: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            email: {
                type: String,
                required: true,
                trim: true,
            },
            username: {
                type: String,
                trim: true,
                default: '',
            },
            permission: {
                type: String,
                enum: ['read', 'write'],
                default: 'read',
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending',
            }
        },
    ],
    version: {
        type: Number,
        default: 1,
    },
    public: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model('Document', documentSchema);
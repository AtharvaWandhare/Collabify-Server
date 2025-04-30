import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: false,
        default: '',
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
            permission: {
                type: String,
                enum: ['read', 'write'],
                default: 'read',
            },
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
import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';

export interface IPost extends Document {
    title: string;
    content: string;
    author: IUser['_id'];
    published: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: { 
        type: String, 
        required: [true, 'Content is required']
    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'Author is required']
    },
    published: { 
        type: Boolean, 
        default: false 
    },
    tags: [{ 
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Add indexes
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

// Add any instance methods here
postSchema.methods.toJSON = function() {
    const post = this.toObject();
    post.id = post._id;
    delete post._id;
    delete post.__v;
    return post;
};

// Add any static methods here
postSchema.statics.findByAuthor = function(authorId: string) {
    return this.find({ author: authorId }).sort({ createdAt: -1 });
};

postSchema.statics.findPublished = function() {
    return this.find({ published: true }).sort({ createdAt: -1 });
};

const Post = (mongoose.models.Post as Model<IPost>) || mongoose.model<IPost>('Post', postSchema);

export default Post; 
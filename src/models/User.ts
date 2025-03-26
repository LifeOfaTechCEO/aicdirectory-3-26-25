import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    emailVerified?: Date;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    name: { 
        type: String, 
        required: [true, 'Name is required'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    image: { 
        type: String 
    },
    emailVerified: {
        type: Date,
        default: null
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'],
        default: 'user'
    }
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

// Add any instance methods here
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    user.id = user._id;
    delete user._id;
    delete user.__v;
    return user;
};

// Add any static methods here
userSchema.statics.findByEmail = function(email: string) {
    return this.findOne({ email: email.toLowerCase() });
};

const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User; 
import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    username: String;
    email: String;
    password: String;
    avatar_url?: any;
    user_friends?: String;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: { unique: true }
    },
    email: {
        type: String,
        required: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    },
    avatar_url: String,
    user_friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    deleted_at: Date
});

export default mongoose.model<IUser>('User', schema);

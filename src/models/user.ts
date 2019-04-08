import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
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

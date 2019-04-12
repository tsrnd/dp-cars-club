import * as mongoose from 'mongoose';

export interface IRoom extends mongoose.Document {
    name: String;
    users?: String;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: { unique: true }
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

export default mongoose.model<IRoom>('Room', schema);

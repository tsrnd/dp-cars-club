import * as mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
    message: String;
    user: any;
    room_id: any;
    status: Number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    user: {
        _id: mongoose.Schema.Types.ObjectId,
        username: String,
        avatar_url: String
    },
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    status: Number,
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

export default mongoose.model<IMessage>('Message', schema);

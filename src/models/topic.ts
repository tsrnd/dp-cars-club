import * as mongoose from 'mongoose';

export interface ITopic extends mongoose.Document {
    title: String;
    content: String;
    car_id?: mongoose.Schema.Types.ObjectId;
    user_id?: mongoose.Schema.Types.ObjectId;
    comments: any;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    car_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    comments: [
        {
            content: String,
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ],
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

export default mongoose.model<ITopic>('Topic', schema);

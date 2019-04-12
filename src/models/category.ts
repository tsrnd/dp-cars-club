import * as mongoose from 'mongoose';

export interface ICategory extends mongoose.Document {
    name: String;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    name: {
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

export default mongoose.model<ICategory>('Category', schema);

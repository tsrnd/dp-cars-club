import * as mongoose from 'mongoose';

const DB_DRIVER = process.env.DB_DRIVER || 'mongodb';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'mydb';
const DB_PORT = process.env.DB_PORT || '27017';
const DB_USER = process.env.DB_USER || 'myuser';
const DB_PASSWORD = process.env.DB_PASSWORD || 'mypass';

class DBConnection {
    connect() {
        mongoose.connect(
            `${DB_DRIVER}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
            {
                useNewUrlParser: true
            }
        );
        const db = mongoose.connection;
        db.on('error', (err: any) => {
            console.error('Connect error: ', err);
        });
        db.once('open', function() {
            console.log('Mongodb connected success.');
        });
    }
}

export default DBConnection;

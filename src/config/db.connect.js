import mongoose from 'mongoose';
import { DB_NAME } from './keys.js';

const connectDB = async () => {
    try {
        // const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;
        // console.log(`Connecting to MongoDB Servers...\nMONGODB_URI: ${uri}`);
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB Successfully connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error while connecting to MongoDB Servers:\n\t ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;
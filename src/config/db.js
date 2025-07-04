import mongoose from "mongoose";

const connectDB = async() => {
    
    try {
        console.log(`env ${process.env.MONGO_URI}`);
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        })
        console.log('MongoDB Connected...');
    } catch(error){
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;
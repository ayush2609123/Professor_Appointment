import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
const connectDB = async () => {
    try {
        const dbURI = `mongodb+srv://ayush121:pumpum223@cluster0.unr9i.mongodb.net/ProfessorAppointment?retryWrites=true&w=majority&appName=Cluster0
`;

        console.log(`Connecting to MongoDB with URI: ${dbURI}`);
        const connectionInstance = await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`\nMongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
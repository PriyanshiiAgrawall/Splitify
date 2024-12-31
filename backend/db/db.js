import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";

const Url = process.env.URL;
export const dbConnect = async () => {
    try {

        await mongoose.connect(Url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connection to db successful");
    } catch (err) {
        console.error("Connection to db unsuccessful", err);
    }
};


import bcrypt from "bcryptjs";
import { z } from "zod";
import logger from "../utils/logger.js";
import User from "../models/User.js";


const userRegistrationInput = z.object({
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().optional(),
    emailId: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const userReg = async (req, res) => {
    try {

        const validatedData = userRegistrationInput.parse(req.body);
        //If the input (req.body) does not match the userRegistrationInput, Zod will automatically throw an error we do not manually return respose
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ emailId: validatedData.emailId });
        if (existingUser) {
            logger.error(`URL : ${req.originalUrl} | Status: 403 | Email already exists`);
            return res.status(403).json({
                status: "Fail",
                message: "Email already exists",
            });
        }
        // Hash the password using bcrypt and setting it in place of original password
        //salt - A random string added to a password before hashing to make the hash unique, Even if two users have the same password, the salt ensures their hashes are different, making it harder for attackers to guess passwords.
        const salt = await bcrypt.genSalt(10);
        validatedData.password = await bcrypt.hash(validatedData.password, salt);

        // Create a new user in the database
        const newUser = await User.create(validatedData);

        // Respond with success
        res.status(200).json({
            status: "Success",
            message: "User Registration Successful",
            userId: newUser._id,
        });
        //id is send as response for further calls ex- updating user,fetching user groups etc

    } catch (err) {

        logger.error(`URL : ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            status: "Fail",
            message: err.message,
        });
    }
};

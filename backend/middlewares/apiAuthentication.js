import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

//exports. is commonjs syntax
export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "3d",
    })
}
export const validateToken = (req, res, next) => {
    // Skip authentication in development mode
    // if (process.env.DISABLE_API_AUTH === "true") {
    //     return next(); // Let the request go through 
    // }

    // Checking if the token is present
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        logger.error(`API Authentication Fail: Token not present`);
        return res.status(403).json({ message: "Token not present as Authorization Header is empty" });
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1]; // "Bearer <token>" //it will put this in an array [Bearer,<token>]

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.error(`API Authentication Fail: Invalid Token`);
            return res.status(403).json({ message: "Invalid Token" });
        }

        req.user = decoded; // Attaching decoded data to the request
        next(); // Let the request go through
    });
};

/*
Validation function to check if the user is the same as the token user
*/
export const validateUser = (inputtedEmail, emailWhichWePutInResponse) => {
    // Check if API authentication is enabled and the user doesn't match the token
    // if (process.env.DISABLE_API_AUTH !== "true" && toBeCheckedEmail !== tokenPayloadEmail) {
    //     const err = new Error("Access Denied");
    //     err.status = 403;
    //     throw err;
    // }

    // Check if API authentication is enabled and the user doesn't match the token
    //emailWhichWePutInResponse will come in subsequent Requests
    if (inputtedEmail !== emailWhichWePutInResponse) {
        const err = new Error("Access Denied as you are trying to acess someone else's details");
        err.status = 403;
        throw err;
    }
    // User is valid
    return true;


}
//cant use export default with inline functions 


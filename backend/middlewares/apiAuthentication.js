import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

exports.validateToken = (req, res, next) => {
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
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.error(`API Authentication Fail: Invalid Token`);
            return res.status(403).json({ message: "Invalid Token" });
        }

        req.user = user; // Attaching user data to the request
        next(); // Let the request go through
    });
};

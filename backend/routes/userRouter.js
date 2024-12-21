import express from "express";
import { userRegistration, userLogin, fetchAllRegisteredEmails, viewUser } from "../controllers/User.js";
import { validateToken } from "../middlewares/apiAuthentication.js"
const router = express.Router();

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.get("/fetchAllRegisteredEmails", fetchAllRegisteredEmails);
router.get("/viewuser", validateToken, viewUser);


export default router;
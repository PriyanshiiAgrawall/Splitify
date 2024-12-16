import express from "express";
import { userRegistration, userLogin, fetchAllRegisteredEmails } from "../controllers/User.js";

let router = express.Router();

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.get("/fetchAllRegisteredEmails", fetchAllRegisteredEmails)



export default router;
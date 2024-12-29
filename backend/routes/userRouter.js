import express from "express";
import { userRegistration, userLogin, fetchAllRegisteredEmails, viewUser, editUser, deleteUser, updatePassword } from "../controllers/User.js";
import { validateToken } from "../middlewares/apiAuthentication.js"
const router = express.Router();

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.get("/fetchAllRegisteredEmails", fetchAllRegisteredEmails);
router.get("/viewUser", validateToken, viewUser);
router.post("/editUser", validateToken, editUser);
router.delete("/deleteUser", validateToken, deleteUser);
router.post("/updatePassword", validateToken, updatePassword);

export default router;
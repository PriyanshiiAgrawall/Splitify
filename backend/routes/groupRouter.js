import express from "express";
const router = express.Router()
import { createGroup } from "../controllers/Group.js";
import { validateToken } from "../middlewares/apiAuthentication.js"
router.post("/creategroup", validateToken, createGroup);


export default router;
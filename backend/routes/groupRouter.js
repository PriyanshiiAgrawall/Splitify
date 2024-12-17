import express from "express";
const router = express.Router()
import { createGroup, deleteGroup, findUserGroups, viewGroup } from "../controllers/Group.js";
import { validateToken } from "../middlewares/apiAuthentication.js"
router.post("/creategroup", validateToken, createGroup);
router.get("/viewgroup", validateToken, viewGroup)
router.get("/findusergroups", validateToken, findUserGroups)
router.delete("/deletegroup", deleteGroup);
export default router;
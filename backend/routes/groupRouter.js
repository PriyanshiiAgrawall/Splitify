import express from "express";
const router = express.Router()
import { createGroup, deleteGroup, editGroup, findUserGroups, viewGroup, makeSettlement, groupBalanceSheet } from "../controllers/Group.js";
import { validateToken } from "../middlewares/apiAuthentication.js"
router.post("/creategroup", validateToken, createGroup);
router.get("/viewgroup", validateToken, viewGroup)
router.post("/editgroup", validateToken, editGroup)
router.get("/findusergroups", validateToken, findUserGroups)
router.delete("/deletegroup", validateToken, deleteGroup);
router.post("/makeSettlement", validateToken, makeSettlement)
router.get("/groupBalanceSheet", validateToken, groupBalanceSheet)
export default router;
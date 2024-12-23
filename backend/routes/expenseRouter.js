import express from "express";
const router = express.Router()
import { validateToken } from "../middlewares/apiAuthentication.js"
import { addExpense, deleteExpense, editExpense, groupCategoryExpense, recentUserExpenses, viewExpense, viewGroupExpense, viewUserExpense } from "../controllers/Expense.js";
router.post("/addexpense", validateToken, addExpense);
router.post("/editexpense", validateToken, editExpense);
router.get("/viewuserexpense", validateToken, viewUserExpense);
router.get("/viewexpense", validateToken, viewExpense);
router.get("/viewgroupexpense", validateToken, viewGroupExpense);
router.get("/recentuserexpense", validateToken, recentUserExpenses);
router.get("/groupCategoryExpense", groupCategoryExpense);
router.delete("/deleteexpense", validateToken, deleteExpense)
export default router;
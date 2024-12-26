import express from "express";
const router = express.Router()
import { validateToken } from "../middlewares/apiAuthentication.js"
import { addExpense, deleteExpense, editExpense, groupCategoryExpense, groupDailyExpense, groupMonthlyExpense, recentUserExpenses, userCategoryExpense, userDailyExpense, userMonthlyExpense, viewExpense, viewGroupExpense, viewUserExpense } from "../controllers/Expense.js";
router.post("/addexpense", validateToken, addExpense);
router.post("/editexpense", validateToken, editExpense);
router.get("/viewuserexpense", validateToken, viewUserExpense);
router.get("/viewexpense", validateToken, viewExpense);
router.get("/viewgroupexpense", validateToken, viewGroupExpense);
router.get("/recentuserexpense", validateToken, recentUserExpenses);
router.get("/groupCategoryExpense", validateToken, groupCategoryExpense);
router.get("/userCategoryExpense", validateToken, userCategoryExpense);
router.get("/userMonthlyExpense", validateToken, userMonthlyExpense);
router.get("/userDailyExpense", validateToken, userDailyExpense);
router.get("/groupMonthlyExpense", validateToken, groupMonthlyExpense);
router.get("/groupDailyExpense", validateToken, groupDailyExpense);

router.delete("/deleteexpense", validateToken, deleteExpense)
export default router;
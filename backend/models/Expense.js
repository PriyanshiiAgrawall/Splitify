import mongoose from "mongoose";
import Group from "./Group.js";
import User from "./User.js";
const ExpenseSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    expenseName: { type: String, required: true },
    expenseDescription: { type: String },
    expenseAmount: { type: Number, required: true },
    expenseCategory: { type: String, default: "Others" }, // Examples: Beauty, Groceries, Dining Out, etc.
    expenseCurrency: { type: String, default: "INR", required: true },
    expenseDate: { type: Date, default: Date.now, required: true },
    expenseCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expensePaidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expenseMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],//members among which this expense will be divided into
    expensePerMember: { type: Number, required: true },
    expenseType: { type: String, enum: ["Cash", "Card", "Online"], default: "Cash", required: true }
    //this can be cash, card or online
});



export default mongoose.model('Expense', ExpenseSchema)

//The ref property in fields like group, expenseCreatedBy, and expensePaidBy simply needs the model name string (e.g., 'Group', 'User') and does not depend on the model being imported into the file. thats why "is declared but values never used is coming in the import"
import mongoose from "mongoose";
const GroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    groupDescription: { type: String },
    groupCurrency: { type: String, default: "INR" },
    groupOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    groupCategory: { type: String, default: "Others" }, // Examples: Trip, Flat, PG, Outing, etc.
    groupTotalExpenditure: { type: Number, default: 0 },
    expenses: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }
    ],
    split: [
        {
            member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            amount: { type: Number }, // Negative means owes; positive means owed
            status: { type: String, enum: ['owes', 'owed'], required: true }
        }
    ] //this split will tell who owes how much amount as a sum total of a group
})

export default mongoose.model('Group', GroupSchema)

//module.exports is commonjs syntax
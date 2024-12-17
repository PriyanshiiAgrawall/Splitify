import mongoose from "mongoose";
const SettlementSchema = mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    settleTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settleFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settleDate: {
        type: Date,
        default: Date.now
    },
    settleAmount: {
        type: Number,
        required: true
    }
})



export default mongoose.model('Settlement', SettlementSchema)
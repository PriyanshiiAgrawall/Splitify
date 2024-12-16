import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    emailId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
//1st argument is what name should the model be called and 2nd is what we defined in this file 
export default mongoose.model('User', UserSchema)

//module.exports is commonjs syntax

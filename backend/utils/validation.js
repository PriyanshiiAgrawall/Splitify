import { z } from 'zod';
import Group from "../models/Group.js";
import logger from './logger.js';
// Schema for non-null values
const notNull = z.string().nonempty("Please input the required field");

// Schema for email validation
const emailValidation = z
    .string()
    .email("Email validation fail!!");

// Schema for password validation
const passwordValidation = z
    .string()
    .min(8, "Password must be at least 8 characters long");

// Schema for currency validation
const currencyValidation = z.enum(["INR", "USD", "EUR", "YEN", "YUAN"]);


// const userSchema = z.object({
//   email: emailValidation,
//   password: passwordValidation,
//   currency: currencyValidation.optional(),
// });

export const userBelongToGroupOrNot = async (userId, groupId) => {
    //fetching groupmembers from the db for a particular id
    const groupMembersObject = await Group.findOne({
        _id: groupId
    }, {
        groupMembers: 1,
        _id: 0
    })
    console.log(groupMembersObject);
    //this query returns an object 
    // {
    // groupMembersObject: [member1,member2,member3]
    //}

    if (!groupMembersObject) {
        throw new Error(`Group with ID ${groupId} not found`);
    }
    //extracting only array
    const groupMembersArray = groupMembersObject.groupMembers;
    if (groupMembersArray.includes(userId))
        return true
    else {
        logger.warn([`Group User Valdation fail : Group ID : [${groupId}] | user : [${userId}]`])
        return false
    }
}

// module.exports = {
//     notNull,
//     emailValidation,
//     passwordValidation,
//     currencyValidation,
//     userSchema,
// };

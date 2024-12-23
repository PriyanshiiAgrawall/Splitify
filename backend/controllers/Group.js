// import { minimumTransactions } from "../utils/split";
// import Decimal from 'decimal.js';
import mongoose from 'mongoose';

import { z } from "zod";
import Group from "../models/Group.js"
import User from "../models/User.js"
import Settlement from "../models/Settlement.js"
import logger from "../utils/logger.js";
import minimumTransactions from '../utils/split.js';
import { userBelongToGroupOrNot } from '../utils/validation.js';
/*
Create Group Function - This function creates new groups
() - means not to be provided in req.body but will be added in db and response
Accepts: Group Name
         Group Description - optional
         Group Members
         groupCurrency
         (groupOwner - decoded token will give this)
         groupCategory - optional
         (groupTotalExpenditure - 0 initially)
         (expenses - empty array)
         (split)

 API: 
*/

const createGroupInput = z.object({
    groupName: z.string().nonempty("Group name is required"),
    groupDescription: z.string().optional(),
    groupCurrency: z.enum(["INR", "USD", "EUR", "YEN", "YUAN"]).default("INR"),
    groupCategory: z.string().optional(),
    // groupTotalExpenditure: z.number().default(0),()
    // expenses: z.array(z.string()).optional(),(initially group will have no expenses hence it will be empty )
    groupMembers: z
        .array(z.string().email('Invalid email format'))

})
//TESTED
export const createGroup = async (req, res) => {
    try {
        //fetch data from req.body 
        const groupData = req.body;

        //person creating the group will add others to group but if he adds nobody he is the only member so add him in member list in req.body
        //in validateToken middleware we put decoded token in req.user so from there fetching email of owner
        const groupOwnerId = req.user.id;
        const groupOwnerEmail = req.user.emailId;
        console.log(groupOwnerEmail);
        //check if groupowner exists in db 
        const ownerExists = await User.findById(groupOwnerId);
        if (!ownerExists) {
            return res.status(400).json({ message: "Invalid group owner" });
        }
        //if no group members present then just put owner in group members 
        //if group members present then check if owner is among them if not then put him/her
        if (!groupData.groupMembers || groupData.groupMembers.length === 0) {
            groupData.groupMembers = [groupOwnerEmail];
        } else if (!groupData.groupMembers.includes(groupOwnerEmail)) {
            groupData.groupMembers.push(groupOwnerEmail);
        }
        //incoming request body has email ids not userids 

        //validate from zod 
        const validatedData = createGroupInput.parse(groupData);


        //validate group members exist in the db 
        const memberIds = [];
        for (let emailId of validatedData.groupMembers) {
            const memberExists = await User.findOne({ emailId: emailId });

            if (!memberExists) {
                return res.status(400).json({ message: `Invalid member ID: ${emailId}` });
            }
            memberIds.push(memberExists._id);
        }

        // Initialize the split array
        const splitArray = memberIds.map((userId) => ({
            member: userId,
            amount: 0,
            status: "owes",
        }));

        validatedData.groupMembers = memberIds;

        //creating entry in db
        const newGroup = await Group.create({
            ...validatedData,
            split: splitArray,
            groupOwner: groupOwnerId,
            groupTotalExpenditure: 0,

        });

        res.status(201).json({
            success: true,
            message: "Group created successfully",
            groupId: newGroup._id,
            group: newGroup
        });
    }
    catch (err) {
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Failed to create group",
        });

    }
}

//TESTED

/*
View Group function 
This function is used to display the group details 
Accepts: Group Id 
Returns: Group Info 
API:
*/

export const viewGroup = async (req, res) => {
    try {
        const { id } = req.query; // Extract group ID from the params
        const groupId = id
        console.log(groupId);
        // validate groupid is given
        if (!groupId) {
            return res.status(400).json({
                status: "Fail",
                message: "Group ID is required",
            });
        }


        // Fetch  group from the db

        const group = await Group.findOne({ _id: groupId })
            .populate("groupOwner", "firstName lastName emailId") // Populate groupOwner with specific fields
            .populate("groupMembers", "firstName lastName emailId") // Populate groupMembers with specific fields
            .populate("expenses") // Populate expenses (assuming Expense schema is referenced)
            .populate({
                path: "split.member", // Populate split.member since it's a nested field
                select: "firstName lastName emailId",
            });



        // Check if the group exists
        if (!group) {
            return res.status(404).json({
                status: "Fail",
                message: "Group not found",
            });
        }

        //check the person who is retriving group is group member 
        const memberRetrivingGroupId = req.user.id;
        if (!group.groupMembers.some(member => member._id.toString() === memberRetrivingGroupId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action. Only the person who is part of the group can access it",
            });
        }


        // Respond with the group details
        res.status(200).json({
            status: "Success",
            group,
        });
    } catch (err) {
        // Log the error and respond with a failure status
        logger.error(`URL : ${req.originalUrl} | Status : ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            status: "Fail",
            message: err.message || "Internal Server Error",
        });
    }
};
//6765e0cfd0e9ad1a515e7232


/*
Find all groups of user function
This function is basically to display the list of group that a user belongs
Accepts: user email ID
Validation: email Id present in DB
*/
//TESTED
export const findUserGroups = async (req, res) => {
    try {
        const userId = req.query.userId;


        if (!userId) {
            return res.status(400).json({
                status: "Fail",
                message: "User Id cant be fetched issue with frontend sending it",
            });
        }
        // Validate token has same id 
        const tokenUserId = req.user.id
        if (!tokenUserId) {
            return res.status(400).json({
                status: "Fail",
                message: "User Id cant be fetched from token issue with token",
            });
        }

        //frontend send id and token user id should be same 
        if (userId.toString() !== tokenUserId.toString()) {
            return res.status(400).json({
                status: "Fail",
                message: "User Id and token user id mismatch",
            });

        }

        // // Find the user's ObjectId using emailId
        // const user = await User.findOne({ emailId });
        // if (!user) {
        //     return res.status(404).json({
        //         status: "Fail",
        //         message: "User not found",
        //     });
        // }

        // const userId = user._id; // Extract the ObjectId of the user

        // Find groups where the user is a member
        const groups = await Group.find({ groupMembers: userId })
            .sort({ $natural: -1 })
            .populate("groupMembers", "firstName lastName emailId")
            .populate("groupOwner", "firstName lastName emailId").populate({
                path: "split.member", // Populate the 'member' field inside the split array
                select: "firstName lastName emailId", // Select the fields you want to populate
            });
        //When { $natural: -1 }: Documents are returned in reverse order of insertion (descending order).
        //ensures the newest documents (those inserted most recently) are returned first.
        res.status(200).json({
            status: "Success",
            groups: groups,
        });
    } catch (err) {
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            status: "Fail",
            message: err.message || "An error occurred while finding user groups",
        });
    }
};




/*
Edit Group Function
This function is to edit the already existing group to make changes.
Accepts: Group Id
        Modified group info
*/
//TESTED



// Zod schema for editing group
const editGroupInput = z.object({
    groupId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Group ID"
    }),
    groupName: z.string().optional(),
    groupDescription: z.string().max(100, {
        message: "Description is too long"
    }).optional(),
    groupCategory: z.string().optional(),
    groupMembers: z.array(
        z.string("Member ID cannot be empty")
    ).optional(),

});

export const editGroup = async (req, res) => {
    try {
        // Parse and validate input using Zod
        const validatedData = editGroupInput.parse(req.body);

        // Fetch the group by ID
        const group = await Group.findById(validatedData.groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        //person editing should be in the group 
        const personEditingId = req.user.id;
        //groupMembers is array of emails
        let groupMembersIds = []
        for (let email of req.body.groupMembers) {
            let user = await User.findOne({ emailId: email });
            if (!user) {
                return res.status(403).json({
                    success: false,
                    message: `Group member ${email} not found in the database`,
                });
            }
            groupMembersIds.push(user._id.toString())

        }
        if (!groupMembersIds.includes(personEditingId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action. Only the person who is the part of the group can edit it",
            });
        }
        //new group members array cant be empty if it is put person editing in the group members and make them owner 
        if (!validatedData.groupMembers || validatedData.groupMembers.length === 0) {
            groupMembersIds = [personEditingId];
            validatedData.groupOwner = personEditingId

            // Log a warning for the user but do not return early
            console.warn(
                "You are the only member left in the group so you can't leave, Delete group to leave"
            );

        }

        let updatedSplit = [];
        ////if group members are edited then see all to be deleted members should have split amount = 0
        const memberIdsToRemove = group.groupMembers.filter(
            (memberId) => !groupMembersIds.includes(memberId.toString())
        );

        //splitEntry is the split array of members who are to be removed 
        for (const memberId of memberIdsToRemove) {
            const splitEntryArray = group.split.find(
                (split) => split.member.toString() === memberId.toString()
            );
            if (splitEntryArray && splitEntryArray.amount !== 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot remove member ${memberId} from the group. Others/They haven't settled up their balances.`,
                });
            }
        }




        // Remove members who are in memberIdsToRemove
        // updatedSplit will have split array of those members who are present before and after editing
        // Add missing members to the updatedSplit array with an initial split amount of 0
        groupMembersIds.forEach((memberId) => {
            const isAlreadyPresent = updatedSplit.some(
                (split) => split.member.toString() === memberId.toString()
            );
            if (!isAlreadyPresent) {
                updatedSplit.push({ member: memberId, amount: 0, status: "owes" });
            }
        });

        //if groupmembers are edited and groupowner is deleted out of the group who will be the group owner 
        const isOwnerPresent = groupMembersIds.includes(group.groupOwner.toString());

        if (!isOwnerPresent) {
            // Assign a new group owner from the remaining members
            const [newOwner] = groupMembersIds; //  the first member is the new owner
            if (!newOwner) {
                return res.status(400).json({
                    success: false,
                    message: "Group must have at least one member",
                });
            }
            validatedData.groupOwner = newOwner;
        }

        const updatePayload = {
            groupName: validatedData.groupName ?? group.groupName,
            //The nullish coalescing operator (??) is used to return the right-hand operand when the left-hand operand is null or undefined.
            //Does not consider 0, '', or false as "fallback-triggering" values
            groupCategory: validatedData.groupCategory ?? group.groupCategory,
            groupMembers: groupMembersIds,
            groupOwner: validatedData.groupOwner,
            split: updatedSplit,
        };
        // Only add `groupDescription` if it exists in the validated data or the existing group
        //group category has others value as default so no issue with it
        if (validatedData.groupDescription || group.groupDescription) {
            updatePayload.groupDescription = validatedData.groupDescription ?? group.groupDescription;
        }
        // Update the group details
        const updateResponse = await Group.updateOne(
            { _id: validatedData.groupId },
            {
                $set: updatePayload
            }
        );

        // Check if update was successful
        if (updateResponse.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Failed to update the group",
            });
        }

        res.status(200).json({
            success: true,
            message: "Group updated successfully",
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            // Handle Zod validation errors
            return res.status(400).json({
                success: false,
                message: err.errors[0]?.message || "Validation error",
            });
        }

        // Handle unexpected errors
        logger.error(
            `URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`
        );
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};



/*
Delete Group Function
This function is used to delete the existing group
Accepts: Group Id
Validation: exisitng group Id
 //TESTED
*/
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.body;

        // Validate input
        if (!groupId) {
            return res.status(400).json({
                message: "Group ID is required",
                status: "Fail",
            });
        }

        // Find and delete the group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                message: "Group not found",
                status: "Fail",
            });
        }
        //person deleting the group should be the member of the group 
        const personDeletingGroup = await userBelongToGroupOrNot(req.user.id, groupId);
        if (!personDeletingGroup) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action. Only the person who is the part of the group can delete it",
            })
        }
        // Delete all expenses associated with the group
        await Expense.deleteMany({ groupId: groupId });
        await group.deleteOne(); // Deletes the found group
        //delete expenses associated with this group

        res.status(200).json({
            message: "Group deleted successfully!",
            status: "Success",
        });
    } catch (err) {
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            message: err.message || "Failed to delete the group",
            status: "Fail",
        });
    }
};



/*
Make Settlement Function 
This function is used to make the settlements in the gorup 
 
*/
const settlementInputSchema = z.object({
    groupId: z.string().nonempty("Group ID is required"),
    settleTo: z.string().nonempty("SettleTo (User ID) is required"),
    settleFrom: z.string().nonempty("SettleFrom (User ID) is required"),
    settleAmount: z.number().positive("Settlement amount must be greater than 0"),
    settleDate: z.date().optional(), // as `Date.now` in the model is present
});

export const makeSettlement = async (req, res) => {
    try {
        // Validate request body with Zod
        const validatedData = settlementInputSchema.parse(req.body);

        // Find the group by groupId
        const group = await Group.findById(validatedData.groupId);
        if (!group) {
            return res.status(400).json({ message: "Invalid Group ID" });
        }
        //check if the person asking for settlement is group member 
        const personSettling = await userBelongToGroupOrNot(req.user.id, validatedData.groupId);
        if (!personSettling) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action. Only the person who is the part of the group can try to settle expense",
            })
        }
        //check if settled to settled from are group members
        const isSettleToGroupMember = group.groupMembers.some(
            (member) => member.toString() === validatedData.settleTo
        );
        const isSettleFromGroupMember = group.groupMembers.some(
            (member) => member.toString() === validatedData.settleFrom
        );

        //objectid(not string in mongo) and id string send in request is seen as different types thats why toString() is used


        if (!isSettleToGroupMember || !isSettleFromGroupMember) {
            return res.status(400).json({
                message: "Both settleTo and settleFrom must be members of the group",
            });
        }
        //check if the person asking for settlement is settle to or settle from 
        if (req.user.id !== validatedData.settleTo || req.user.id !== validatedData.settleFrom) {
            return res.status(403).json({
                success: false,
                message: "Only members involved in the expenses can settle it",
            })

        }

        // Check if the split array exists
        if (!group.split || group.split.length === 0) {
            return res.status(400).json({ message: "Group has no split data to update" });
        }

        // Update the split data for settleFrom and settleTo
        const splitArray = group.split.map((split) => {
            if (split.member.toString() === validatedData.settleFrom) {
                split.amount += validatedData.settleAmount;
                split.status = split.amount >= 0 ? "owed" : "owes";
            }
            if (split.member.toString() === validatedData.settleTo) {
                split.amount -= validatedData.settleAmount;
                split.status = split.amount >= 0 ? "owed" : "owes";
            }
            return split;
        });

        // Update the group's split in the database
        group.split = splitArray;
        await group.save();

        // Create a new settlement entry in the database
        const newSettlement = await Settlement.create(validatedData);

        // Respond with success
        res.status(200).json({
            message: "Settlement successful!",
            status: "Success",
            group: group._id,
            settlement: newSettlement,
        });
    } catch (err) {
        logger.error(
            `URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`
        );
        res.status(err.status || 500).json({
            message: err.message || "Failed to make settlement",
        });
    }
};



/*
Add Split function 
This function is called when a new expense is added 
This function updates the member split amount present in the goroup 
Accepts gorupId
        per person exp
        exp owner 
        exp members 
it will add split to the owner and deduct from the remaining members 
This function is not a direct API hit - it is called by add expense function so it is a utility function and hence it should not return http response
*/
//TESTED
export const addSplit = async (groupId, expenseAmount, expenseOwner, expenseMembers, originalUrl = '') => {
    try {
        const group = await Group.findOne({
            _id: groupId
        })
        if (!group) {
            //this throw will stop further execution of code
            throw new Error("Group doesn't exist");
        }
        //adding expense to the total expenditure of group
        group.groupTotalExpenditure += expenseAmount
        //finding the object which belongs to the owner
        const ownerSplit = group.split.find((entry) => entry.member.toString() === expenseOwner.toString());
        //if owner object not found
        if (!ownerSplit) {
            throw new Error("Owner is not a member of the group");
        }
        //if owner object found then add amount to it's balance 
        ownerSplit.amount += expenseAmount;
        //edit the status
        if (ownerSplit.amount >= 0) {
            ownerSplit.status = "owed"
        }
        else {
            ownerSplit.status = "owes"
        }

        let expensePerPerson = expenseAmount / expenseMembers.length
        expensePerPerson = Math.round((expensePerPerson + Number.EPSILON) * 100) / 100;

        //update each members amount
        for (const user of expenseMembers) {
            // Find the specific split object for the user
            const userSplit = group.split.find((entry) => entry.member.toString() === user.toString());
            if (!userSplit) {
                throw new Error(`User ${user} is not part of the group`);
            }
            // Deduct the per-person expense from the user's amount
            userSplit.amount -= expensePerPerson;
            //update status too 

            if (userSplit.amount >= 0) {
                userSplit.status = "owed"
            }
            else {
                userSplit.status = "owes"
            }
        }

        //Nullifying split
        let bal = 0
        for (const entry of group.split) {
            bal += entry.amount; // Add each member's amount to the balance
        }

        //Updating back the split values to the group
        await Group.updateOne({
            _id: groupId
        }, group)

        return { success: true };
    }
    catch (err) {
        logger.error(
            `URL: ${originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`
        );
        return { success: false, message: err.message };
    }
}


/*
Clear Split function 
This function is used to clear the split caused due to a prev expense 
This is used guring edit expense or delete expense operation 
Works in the reverse of addSplit function 
*/
export const clearSplit = async (groupId, expenseAmount, expenseOwner, expenseMembers, originalUrl = '') => {
    try {
        const group = await Group.findOne({
            _id: groupId
        })
        if (!group) {
            //this throw will stop further execution of code
            throw new Error("Group doesn't exist");
        }
        //adding expense to the total expenditure of group
        group.groupTotalExpenditure -= expenseAmount
        //finding the object which belongs to the owner
        const ownerSplit = group.split.find((entry) => entry.member.toString() === expenseOwner.toString());
        //if owner object not found
        if (!ownerSplit) {
            throw new Error("Owner is not a member of the group");
        }
        //if owner object found then add amount to it's balance 
        ownerSplit.amount -= expenseAmount;


        //edit the status
        if (ownerSplit.amount >= 0) {
            ownerSplit.status = "owed"
        }
        else {
            ownerSplit.status = "owes"
        }
        let expensePerPerson = expenseAmount / expenseMembers.length
        expensePerPerson = Math.round((expensePerPerson + Number.EPSILON) * 100) / 100;

        //update each members amount
        for (const user of expenseMembers) {
            // Find the specific split object for the user
            const userSplit = group.split.find((entry) => entry.member.toString() === user.toString());
            if (!userSplit) {
                throw new Error(`User ${user} is not part of the group`);
            }
            // Deduct the per-person expense from the user's amount
            userSplit.amount += expensePerPerson;
            //update status too 

            if (userSplit.amount >= 0) {
                userSplit.status = "owed"
            }
            else {
                userSplit.status = "owes"
            }
        }

        //Nullifying split
        let bal = 0
        for (const entry of group.split) {
            bal += entry.amount; // Add each member's amount to the balance
        }

        //Updating back the split values to the group
        await Group.updateOne({
            _id: groupId
        }, group)

        return { success: true };
    }
    catch (err) {
        logger.error(
            `URL: ${originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`
        );
        return { success: false, message: err.message };
    }
}


/*
Group Settlement Calculator 
This function is used to calculate the balnce sheet in a group, who owes whom 
Accepts : group Id 
return : group settlement detals
*/
//TESTED
export const groupBalanceSheet = async (req, res) => {
    try {
        // Validate group ID
        const { groupId } = req.body;
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: "Group ID is required.",
            });
        }
        // Fetch the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Invalid Group ID. Group not found.",
            });
        }
        //person fetching balance sheet belongs to the group
        const person = await userBelongToGroupOrNot(req.user.id, groupId);
        if (!person) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action. Only the person who is the part of the group can fetch group balance sheet",
            })
        }

        // Ensure the split array exists and is valid
        if (!group.split || group.split.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No split data available for this group.",
            });
        }
        //converting split array to transactions object
        const generateTransactions = (splitArray) => {
            const transactions = {};
            for (const entry of splitArray) {
                transactions[entry.member.toString()] = entry.amount;
            }
            return transactions;
        };

        const transactions = generateTransactions(group.split);
        // Pass transactions object to splitCalculator to get minimum transactions needed to settle up
        const balanceSheet = minimumTransactions(transactions);

        // Respond with the calculated balance sheet
        return res.status(200).json({
            success: true,
            message: "Group balance sheet retrieved successfully.",
            data: balanceSheet,
        });
    } catch (err) {
        // Log and handle unexpected errors
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};

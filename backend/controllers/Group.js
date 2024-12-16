// import { minimumTransactions } from "../utils/split";
import { z } from "zod";
import Group from "../models/Group.js"
import User from "../models/User.js"
/*
Create Group Function - This function creates new groups
Accepts: Group Name
         Group Description
         Group Members
         Currency Type
 API: 
*/

const createGroupInput = z.object({
    groupName: z.string().nonempty("Group name is required"),
    groupDescription: z.string().optional(),
    groupCurrency: z.enum(["INR", "USD", "EUR", "YEN", "YUAN"]).default("INR"),
    groupCategory: z.string().optional(),
    // groupTotalExpenditure: z.number().default(0),
    // expenses: z.array(z.string()).optional(),
    groupMembers: z
        .array(z.string().nonempty("Each group member email ID must be valid"))
        .min(1, "Group must have at least one member"),

})

export const createGroup = async (req, res) => {
    try {
        //fetch data from req.body 
        const groupData = req.body;

        //person creating the group will add others to group but if he adds nobody he is the only member so add him in member list in req.body
        //in validateToken middleware we put decoded token in req.user so from there fetching email of owner
        const groupOwnerId = req.user.id;
        //check if groupowner exists in db 
        const ownerExists = await User.findById(groupOwnerId);
        if (!ownerExists) {
            return res.status(400).json({ message: "Invalid group owner" });
        }

        if (!groupData.groupMembers || groupData.groupMembers.length === 0) {
            groupData.groupMembers = [groupOwnerId];
        } else if (!groupData.groupMembers.includes(groupOwnerId)) {
            groupData.groupMembers.push(groupOwnerId);
        }

        //validate from zod 
        const validatedData = createGroupInput.parse(groupData);


        //validate group members exist in the db 
        for (const userId of validatedData.groupMembers) {
            const memberExists = await User.findById(userId);
            if (!memberExists) {
                return res.status(400).json({ message: `Invalid member ID: ${userId}` });
            }
        }
        // Initialize the split array
        const splitArray = validatedData.groupMembers.map((userId) => ({
            member: userId,
            amount: 0,
            status: "owes",
        }));


        validatedData.split = splitArray;
        validatedData.groupOwner = groupOwnerId;


        //creating entry in db
        const newGroup = await Group.create(validatedData);

        res.status(201).json({
            success: true,
            message: "Group created successfully",
            groupId: newGroup._id,
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



/*
View Group function 
This function is used to display the group details 
Accepts: Group Id 
Returns: Group Info 
API:
*/

export const viewGroup = async (req, res) => {
    try {
        const { groupId } = req.body; // Extract group ID from the request body

        // validate groupid is given
        if (!groupId) {
            return res.status(400).json({
                status: "Fail",
                message: "Group ID is required",
            });
        }

        // Fetch  group from the db
        const group = await Group.findOne({ _id: groupId }).populate("groupMembers", "firstName lastName emailId").populate("groupOwner", "firstName lastName emailId").populate({
            path: "split.member",
            select: "firstName lastName emailId",
        });
        //as member in split is a nested field so for population we need to give path 

        // Check if the group exists
        if (!group) {
            return res.status(404).json({
                status: "Fail",
                message: "Group not found",
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



/*
Find all groups of user function
This function is basically to display the list of group that a user belongs
Accepts: user email ID
Validation: email Id present in DB
*/

export const findUserGroups = async (req, res) => {
    try {
        const { emailId } = req.body;

        // Validate input
        if (!emailId) {
            return res.status(400).json({
                status: "Fail",
                message: "Email ID is required",
            });
        }

        // Find the user's ObjectId using emailId
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).json({
                status: "Fail",
                message: "User not found",
            });
        }

        const userId = user._id; // Extract the ObjectId of the user

        // Find groups where the user is a member
        const groups = await Group.find({ groupMembers: userId })
            .sort({ $natural: -1 })
            .populate("groupMembers", "firstName lastName emailId")
            .populate("groupOwner", "firstName lastName emailId");
        //When { $natural: -1 }: Documents are returned in reverse order of insertion (descending order).
        //ensures the newest documents (those inserted most recently) are returned first.
        res.status(200).json({
            status: "Success",
            groups,
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




/*
Delete Group Function
This function is used to delete the existing group
Accepts: Group Id
Validation: exisitng group Id
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

        await group.deleteOne(); // Deletes the found group

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




/*
Add Split function 
This function is called when a new expense is added 
This function updates the member split amount present in the goroup 
Accepts gorupId
        per person exp
        exp owner 
        exp members 
it will add split to the owner and deduct from the remaining members 
This function is not a direct API hit - it is called by add expense function 
*/



/*
Clear Split function 
This function is used to clear the split caused due to a prev expense 
This is used guring edit expense or delete expense operation 
Works in the reverse of addSplit function 
*/



/*
Group Settlement Calculator 
This function is used to calculate the balnce sheet in a group, who owes whom 
Accepts : group Id 
return : group settlement detals
*/
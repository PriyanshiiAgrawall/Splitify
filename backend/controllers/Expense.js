import mongoose from 'mongoose';
import { z } from 'zod';
import logger from '../utils/logger.js';
import Group from '../models/Group.js';
import { userBelongToGroupOrNot } from '../utils/validation.js';
import { addSplit, clearSplit } from './Group.js';
import Expense from '../models/Expense.js'
import User from '../models/User.js';
//input expense request will have
const inputExpenseSchema = z.object({
    //The .refine() method is used to add custom validation logic for the field. 
    groupId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Group ID"
    }),
    expenseName: z.string().nonempty("Expense name is required"),
    expenseAmount: z.string(),
    //non empty cant be used on numbers

    expensePaidBy: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid paid by user ID",
    }),
    expenseCreatedBy: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Owner ID",
    }),
    expenseAmount: z.number().positive("Number should be greater than 0"),
    expenseMembers: z.array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Member ID",
    })).nonempty("Expense members cannot be empty"),
    expenseDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid date format",
    }),
    expenseDescription: z.string().max(100, "Description cannot exceed 100 characters").optional(),
    expenseCategory: z.string().optional(),
    // expenseCurrency: z.string().optional(),//fetched from group currency 
    expenseType: z.enum(["Cash", "Card", "Online"], {
        errorMap: () => ({
            message: "Invalid expense type. Allowed values are 'Cash', 'Card', or 'Online'.",
        }),
    }).optional(),
});
/*
Add Expense function
This function is used to add expense to the group 
Accepts: Group ID
          Expense Name
          Expense Describtion - max 100 
          Expense Amount - it is string coming from frontend 
          (Expense Created By- who is creating is automatically owner and hence no need to send it)
         Expense Paid By 
         ExpenseCategory - optional
         (ExpenseCurrency -  will be same as group currency so no need to send it in request)
         (Expense Date- date.now will be set to it)
         Expense Members 
         (Expense Per Member - will be calculated and send)
         Expense Type - default is already given i.e. cash, options- cash/card

         //TESTED
*/

//expense currency will be same as group currency
//expense owner will be same as who is creating the expense 

export const addExpense = async (req, res) => {
    try {

        const data = req.body;

        if (!data.expenseMembers || !data.expenseOwner || !data.expensePaidBy) {
            return res.status(403).json({
                success: false,
                message: "Please send all the details",
            })
        }

        const membersExpenseIds = []
        for (let email of data.expenseMembers) {
            let member = await User.findOne({ emailId: email })
            if (!member) {
                return res.status(403).json({
                    success: false,
                    message: `user ${email} doesn't exist in the database`,
                })
            }
            membersExpenseIds.push(member._id.toString());
        }
        const owner = await User.findOne({ emailId: data.expenseOwner });
        if (!owner) {
            return res.status(403).json({
                success: false,
                message: `owner ${data.expenseOwner} doesn't exist in the database`,
            })

        }
        const ownerId = owner._id.toString();

        const paidBy = await User.findOne({ emailId: data.expensePaidBy });
        if (!paidBy) {
            return res.status(403).json({
                success: false,
                message: `The person who paid the expense ${data.expensePaidBy} doesn't exist in the database`,
            })

        }
        const paidById = paidBy._id.toString();

        const amount = Number(data.expenseAmount)
        if (amount < 0) {
            return res.status(403).json({
                success: false,
                message: `expense amount should be positive`,
            })

        }
        const inputRefactoredData = {
            groupId: data.groupId,
            expenseName: data.expenseName,
            expenseAmount: amount,
            expensePaidBy: paidById,
            expenseCreatedBy: ownerId,
            expenseMembers: membersExpenseIds,
            expenseDate: data.expenseDate,
            expenseDescription: data.expenseDescription ?? "",
            expenseCategory: data.expenseCategory ?? "Others",
            expenseType: data.expenseType ?? "Cash",

        }
        const validatedExpense = inputExpenseSchema.parse(inputRefactoredData);

        // Check if the group exists
        const group = await Group.findById({ _id: validatedExpense.groupId });
        if (!group) {
            return res.status(403).json({
                success: false,
                message: "Requested Group doesn't exist, so expense cant be added ",
            })
        }
        //get owner id email from token decoding
        const ownerIDfromToken = req.user.id;
        if (!ownerIDfromToken) {
            return res.status(403).json({
                success: false,
                message: "Owner can't be fetched, you have issue with your token ",
            })
        }

        if (ownerIDfromToken !== ownerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Owner coming from token and frontend are different",
            })

        }


        // Validate the owner belongs to the group
        const ownerValidation = await userBelongToGroupOrNot(ownerId, validatedExpense.groupId);
        if (!ownerValidation) {
            return res.status(403).json({
                success: false,
                message: "Owner doesn't belog to the group they are requesting the expense for",
            })
        }

        //expense paid by 
        const expensePaidById = validatedExpense.expensePaidBy;

        //validating expense paid by person belongs to the group 
        const paidByValidation = await userBelongToGroupOrNot(expensePaidById, validatedExpense.groupId);
        if (!paidByValidation) {
            return res.status(403).json({
                success: false,
                message: "The person who paid the expenses doesn't belog to the group they are requesting the expense for",
            })
        }
        // Validate all members belong to the group
        for (const memberId of validatedExpense.expenseMembers) {

            const memberValidation = await userBelongToGroupOrNot(memberId, validatedExpense.groupId);
            if (!memberValidation) {
                return res.status(403).json({
                    success: false,
                    message: `Member ${memberId} doesn't belong to the group`,

                })
            }
        }

        // // Ensure `expensePaidBy` person is included in `expenseMembers`
        // if (!validatedExpense.expenseMembers.includes(expensePaidById)) {
        //     validatedExpense.expenseMembers.push(expensePaidById);
        // }

        // Calculate the per-member expense 
        const expensePerMember = Math.round((validatedExpense.expenseAmount / validatedExpense.expenseMembers.length + Number.EPSILON) * 100) / 100;


        // Create the new expense
        const newExpense = await Expense.create({
            ...validatedExpense,
            expensePerMember: expensePerMember,
            expenseCurrency: group.groupCurrency,
        });

        // Update the group split values
        const updateResponse = await addSplit(
            validatedExpense.groupId,
            validatedExpense.expenseAmount,
            expensePaidById,
            validatedExpense.expenseMembers,
            req.originalUrl
        );
        if (updateResponse.success === false) {
            return res.status(400).json({
                success: false,
                message: `Failed to update group split: ${updateResponse.message}`
            })
        }

        //add this expense to group expenses field 
        group.expenses.push(newExpense._id);
        await group.save();
        // Send the success response
        res.status(200).json({
            success: true,
            message: "New expense added",
            expenseId: newExpense._id, splitUpdateResponse: updateResponse,
        });
    } catch (err) {
        // Log the error and send the response
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            message: err.message || "Internal Server Error",
        });
    }
};

/*
Edit Expense function
This function is used to edit the previously added expense to the group
Accepts: Group ID not null group ID exist in the DB 
         Expense ID not null expense ID exist in the DB for the perticular group
         Expense Name Not Null
         Expense Desc max 100 limit Expense Amount not null
         Expense Owner - not null --member in the DB
         Expense Members not null members in the DB
*/
//TESTED
// Zod Schema for Validation

const editExpenseSchema = z.object({

    id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Expense ID",
    }),
    groupId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Group ID"
    }),
    expenseName: z.string().nonempty("Expense name is required").optional(),
    expenseAmount: z.number().positive("Expense amount must be a positive number").optional(),
    //non empty cant be used on numbers

    expensePaidBy: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Owner ID",
    }).optional(),
    expenseMembers: z.array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Member ID",
    })).optional(),
    expenseDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid date format",
    }).optional(),
    expenseDescription: z.string().max(100, "Description cannot exceed 100 characters").optional(),
    expenseCategory: z.string().optional(),
    // expenseCurrency: z.string().optional(),//fetched from group currency 
    expenseType: z.enum(["Cash", "Card", "Online"], {
        errorMap: () => ({
            message: "Invalid expense type. Allowed values are 'Cash', 'Card', or 'Online'.",
        }),
    }).optional(),
});



export const editExpense = async (req, res) => {
    try {
        // Validate the request body
        const validatedExpense = editExpenseSchema.parse(req.body);

        // Fetch the old expense
        const oldExpense = await Expense.findById(validatedExpense.id);
        if (!oldExpense || oldExpense.groupId.toString() !== validatedExpense.groupId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Expense ID or Group ID mismatch",
            });
        }

        // Check if the group exists
        const group = await Group.findById(validatedExpense.groupId);
        if (!group) {
            return res.status(400).json({
                success: false,
                message: "Requested Group doesn't exist, so expense can't be edited",
            });
        }

        // Decode the owner from the token
        const ownerID = req.user.id;
        if (!ownerID) {
            return res.status(403).json({
                success: false,
                message: "Owner can't be fetched, issue with your token",
            });
        }
        //validate owner is the same person who created the expense
        if (oldExpense.expenseCreatedBy.toString() !== ownerID) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action. Only the person who created the expense can edit it.",
            });
        }
        // Validate the owner belongs to the group
        const ownerValidation = await userBelongToGroupOrNot(ownerID, validatedExpense.groupId);
        if (!ownerValidation) {
            return res.status(403).json({
                success: false,
                message: "Owner doesn't belong to the group",
            });
        }

        // Validate expense paid by belongs to the group
        const paidByValidation = await userBelongToGroupOrNot(validatedExpense.expensePaidBy, validatedExpense.groupId);
        if (!paidByValidation) {
            return res.status(403).json({
                success: false,
                message: "The person who paid the expenses doesn't belong to the group",
            });
        }

        // Validate all members belong to the group
        for (const memberId of validatedExpense.expenseMembers) {
            const memberValidation = await userBelongToGroupOrNot(memberId, validatedExpense.groupId);
            if (!memberValidation) {
                return res.status(403).json({
                    success: false,
                    message: `Member ${memberId} doesn't belong to the group`,
                });
            }
        }

        // Calculate the per-member expense
        const expensePerMember = Math.round(
            (validatedExpense.expenseAmount / validatedExpense.expenseMembers.length + Number.EPSILON) * 100
        ) / 100;

        // Clear the old split
        const clearSplitResponse = await clearSplit(
            oldExpense.groupId,
            oldExpense.expenseAmount,
            oldExpense.expensePaidBy,
            oldExpense.expenseMembers,
            req.originalUrl
        );

        if (clearSplitResponse.success === false) {
            return res.status(400).json({
                success: false,
                message: `Failed to clear old split: ${clearSplitResponse.message}`,
            });
        }

        // Update the expense
        const expenseUpdate = await Expense.updateOne(
            { _id: validatedExpense.id },
            {
                $set: {
                    groupId: validatedExpense.groupId,
                    expenseName: validatedExpense.expenseName,
                    expenseDescription: validatedExpense.expenseDescription,
                    expenseAmount: validatedExpense.expenseAmount,
                    expensePaidBy: validatedExpense.expensePaidBy,
                    expenseMembers: validatedExpense.expenseMembers,
                    expensePerMember: expensePerMember,
                    expenseType: validatedExpense.expenseType,
                    expenseDate: validatedExpense.expenseDate,
                },
            }
        );
        //modifiedCount is a MongoDB property returned by updateOne. It indicates how many documents were modified by the update operation.
        if (expenseUpdate.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Failed to update the expense",
            });
        }

        // Add the updated split
        const addSplitResponse = await addSplit(
            validatedExpense.groupId,
            validatedExpense.expenseAmount,
            validatedExpense.expensePaidBy,
            validatedExpense.expenseMembers,
            req.originalUrl
        );

        if (addSplitResponse.success === false) {
            return res.status(400).json({
                success: false,
                message: `Failed to update group split: ${addSplitResponse.message}`,
            });
        }

        // Respond with success
        res.status(200).json({
            status: "Success",
            message: "Expense successfully edited",
            expenseId: validatedExpense.id,
        });
    } catch (err) {
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            message: err.message || "Internal Server Error",
        });
    }
};



/*
Delete Expense function
This function is used to deted the expense added to the group
Accepts: Expense id
*/
//TESTED
// Define schema for request validation
const deleteExpenseSchema = z.object({
    id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid Expense ID",
    }),
});

export const deleteExpense = async (req, res) => {
    try {
        // Validate request body using Zod
        const validatedData = deleteExpenseSchema.parse(req.body);


        // Fetch the expense to delete
        const expense = await Expense.findById(validatedData.id);
        if (!expense) {
            return res.status(400).json({
                success: false,
                message: "Invalid Expense ID. Expense not found.",
            });
        }

        // Verify the person who is deleting the expense is the same person who created it
        const personWhoWantsToDeleteExpenseId = req.user.id;

        if (expense.expenseCreatedBy.toString() !== personWhoWantsToDeleteExpenseId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action. Only the person who created the expense can delete it.",
            });
        }

        // Check to which group this expense belongs to
        const groupId = expense.groupId;

        if (!groupId) {
            return res.status(403).json({
                success: false,
                message: "group id not present in expense hence it is not a valid expense",
            });
        }
        //fetch group
        const expenseBelongToAGroup = await Group.findById({ _id: groupId })
        if (!expenseBelongToAGroup) {
            return res.status(403).json({
                success: false,
                message: "Expense doesnt belong to any group",
            });
        }


        // Remove the expense ID from the group's expenses array
        expenseBelongToAGroup.expenses = expenseBelongToAGroup.expenses.filter((expenseId) => expenseId.toString() !== validatedData.id);

        // Save the updated group
        await expenseBelongToAGroup.save();
        const deleteResult = await Expense.deleteOne({ _id: validatedData.id })
        if (deleteResult.deletedCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Failed to delete the expense. Please try again.",
            });
        }

        // Clear the split value for the deleted expense in the group
        await clearSplit(
            expense.groupId,
            expense.expenseAmount,
            expense.expensePaidBy,
            expense.expenseMembers,
            req.originalUrl
        );

        // Respond with success
        res.status(200).json({
            success: true,
            message: "Expense successfully deleted",
        });
    } catch (err) {
        // Log and handle errors
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};

/*
View Individual Expense
This function is used to view individual expense based on the expense ID 
Accepts: Expense Id
Returns: Json with the expense details
*/
//TESTED

export const viewExpense = async (req, res) => {
    try {


        //frontend is sending userId 
        const expenseId = req.query.expenseId;
        //check token decoded id and this is same
        if (!req.user.id) {
            return res.status(400).json({
                success: false,
                message: "User ID is missing,unauthorized access possible issue with the token",
            });
        }



        // Fetch the expense record by ID
        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found for the provided ID.",
            });
        }

        //if a person belongs to the group in which the expense is created only then they can view the expense 
        const personRequestingExpense = req.user.id;
        const group = await Group.findById(expense.groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "The group associated with this expense does not exist.",
            });
        }

        const isMemberOfGroup = await userBelongToGroupOrNot(personRequestingExpense, expense.groupId);
        if (!isMemberOfGroup) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access. You are not a member of the group associated with this expense.",
            });
        }

        // Respond with the fetched expense
        res.status(200).json({
            success: true,
            message: "Expense retrieved successfully.",
            expense: expense,
        });
    } catch (err) {
        // Log and handle errors
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};

/*
View Group Expense function
This function is used to view all the group expense
Accepts: Group Id
Returns: Json with all the expense record and the total expense amount for the group
*/
//TESTED

export const viewGroupExpense = async (req, res) => {
    try {
        const { id } = req.query;
        const groupId = id
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: "Group ID is required",
            });
        }
        //if person belongs to the group then only they can fetch group expenses
        const personRequestingExpense = req.user.id;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "The group associated with this expense does not exist.",
            });
        }

        const isMemberOfGroup = await userBelongToGroupOrNot(personRequestingExpense, groupId);
        if (!isMemberOfGroup) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access. You are not a member of the group associated with this expense.",
            });
        }

        // Fetch all expenses for the specified group
        const groupExpenses = await Expense.find({ groupId: groupId })
            .sort({ expenseDate: -1 })
            .populate('groupId', 'groupName groupCurrency')
            .populate('expenseCreatedBy', 'firstName lastName emailId')
            .populate('expensePaidBy', 'firstName lastName emailId')
            .populate('expenseMembers', 'firstName lastName emailId');


        // Check if there are any expenses
        if (groupExpenses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No expenses found for the specified group",
            });
        }

        // Calculate the total expense amount
        const totalAmount = groupExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);

        // Send the response with expenses and total amount
        return res.status(200).json({
            success: true,
            message: "Group expenses retrieved successfully",
            expenses: groupExpenses,
            totalAmount: totalAmount,
        });
    } catch (err) {
        // Log the error and respond with a server error
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};




/*
User Expense function
This function is used to find all the expense a user is involved in
returns: Expenses
*/
//TESTED
export const viewUserExpense = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(400).json({
                success: false,
                message: `User doesn't exist some issue with token`
            })
        }
        // Convert the user ID in the decoded payload to an ObjectId
        //objectid cant be invoked without new
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const userExpenses = await Expense.find({
            expenseMembers: userId
        }).sort({
            expenseDate: -1 //to get the newest first 
        })
        if (userExpenses.length == 0) {
            return res.status(400).json({
                success: false,
                message: `No expenses found`
            })
        }
        let totalAmount = 0
        for (const expense of userExpenses) {
            totalAmount += expense.expensePerMember
        }
        res.status(200).json({
            status: "Success",
            expense: userExpenses,
            total: totalAmount
        })

    } catch (err) {
        logger.error(`URL : ${req.originalUrl} | staus : ${err.status} | message: ${err.message}`)
        res.status(err.status || 500).json({
            success: false,
            message: err.message
        })
    }
}

/*
Recent User Expenses function
This function is used to return the latest 5 expenses a user is involved in 
Accepts : id from decoded token
Returns : top 5 most resent expense user is a expenseMember in all the groups  
*/
//TESTED
export const recentUserExpenses = async (req, res) => {
    try {

        //frontend is sending userId 
        const userId = req.query.userId;
        //check token decoded id and this is same
        if (!req.user.id) {
            return res.status(400).json({
                success: false,
                message: "User ID is missing, possible issue with the token",
            });
        }
        if (req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access: token user does not match the requested user ID",
            });
        }

        // Fetch the recent expenses for the user
        const recentExpense = await Expense.find({
            expenseMembers: req.user.id
        })
            .sort({ $natural: -1 }) // Get the newest first
            .populate('expenseCreatedBy', 'firstName') // Populate specific fields for the creator
            .populate('expensePaidBy', 'firstName').limit(5);

        // Check if any expenses were found
        if (recentExpense.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No recent expenses found for the user",
            });
        }

        // Return the recent expenses
        res.status(200).json({
            success: true,
            status: "Success",
            expenses: recentExpense,
        });
    } catch (err) {
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
Category-wise group expense calculator function 
This function returns the total expense spent on each category in a group.
Accepts: groupID 
Returns: Total expense per category (for the group as a whole)
*/
export const groupCategoryExpense = async (req, res) => {
    try {
        // Check if groupId is provided in the request body
        const groupId = req.body.id
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: "Group ID is required",
            });
        }
        //validate person fetching response is part of the group 
        const personFetchingResponse = req.user.id;
        const belongToTheGroup = userBelongToGroupOrNot(personFetchingResponse, groupId)
        if (!belongToTheGroup) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized access you dont belong to this group",
            });
        }

        // Perform aggregation to calculate category-wise expenses
        const categoryExpense = await Expense.aggregate([
            {// Filters the documents in the Expense collection to include only those where the groupId matches the provided group ID.
                $match: {
                    groupId: req.body.id,
                },
            },
            {//Groups the filtered documents by their expenseCategory field and calculates the total expense for each category.
                $group: {
                    _id: "$expenseCategory",
                    amount: {
                        $sum: "$expenseAmount",
                    },
                },
            },

            // response is like this
            // {
            //     "_id": "categoryName",
            //     "amount": totalExpenseForCategory
            // }
            //sort in ascending order
            { $sort: { _id: 1 } },
        ]);

        // Check if any data was found
        if (categoryExpense.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No expenses found for the given group ID",
            });
        }

        // Return the aggregated data
        res.status(200).json({
            success: true,
            status: "success",
            data: categoryExpense,
        });
    } catch (err) {
        // Log and return error response
        logger.error(
            `URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`
        );
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};

/**
 * Group Monthly Expense Function
 * This function calculates the total amount spent in a group per month for the current year.
 * Accepts: groupId (via req.body.id)
 * Returns: Array of monthly expenses with year and total amount.
 */

export const groupMonthlyExpense = async (req, res) => {
    try {

        const { groupId } = req.body.id;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: "Group ID is required",
            });
        }
        //validate person fetching response is part of the group 
        const personFetchingResponse = req.user.id;
        const belongToTheGroup = userBelongToGroupOrNot(personFetchingResponse, groupId)
        if (!belongToTheGroup) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized access you dont belong to this group",
            });
        }

        // Aggregate pipeline to calculate monthly expenses
        const monthlyExpense = await model.Expense.aggregate([
            {
                $match: {
                    groupId: groupId, // Match documents belonging to the provided group ID
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$expenseDate" }, // Extract month from expenseDate
                        year: { $year: "$expenseDate" },   // Extract year from expenseDate
                    },
                    amount: { $sum: "$expenseAmount" }, // Calculate total expense per month
                },
            },
            {
                $sort: { "_id.month": 1 }, // Sort results by month in ascending order
            },
        ]);

        // If no expenses found, handle the case
        if (monthlyExpense.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No expenses found for the given group ID",
            });
        }

        // Send success response with data
        res.status(200).json({
            success: true,
            message: "Monthly expenses retrieved successfully",
            data: monthlyExpense,
        });
    } catch (err) {
        // Log the error and send error response
        logger.error(
            `URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`
        );
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};

/**
 * User Daily Expense Function
 * This function calculates the daily amount spent by a user for the past month.
 * Accepts: User email ID (via req.body.user)
 * Returns: Array of daily expenses with date, month, and total amount.
 */

export const userDailyExpense = async (req, res) => {
    try {
        const { user: userEmail } = req.body;

        // Validate input
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "User email is required",
            });
        }

        // Define date range (last 1 month)
        const currentDate = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(currentDate.getMonth() - 1);

        // Aggregate pipeline to calculate daily expenses
        const dailyExpense = await model.Expense.aggregate([
            {
                $match: {
                    expenseMembers: userEmail, // Match user email in expenseMembers array
                    expenseDate: {
                        $gte: oneMonthAgo, // Expenses after one month ago
                        $lte: currentDate, // Expenses up to today
                    },
                },
            },
            {
                $group: {
                    _id: {
                        date: { $dayOfMonth: "$expenseDate" }, // Extract day from expenseDate
                        month: { $month: "$expenseDate" },     // Extract month from expenseDate
                        year: { $year: "$expenseDate" },       // Extract year from expenseDate
                    },
                    amount: { $sum: "$expenseAmount" }, // Sum of expenseAmount for each day
                },
            },
            {
                $sort: {
                    "_id.year": 1,  // Sort by year
                    "_id.month": 1, // Then by month
                    "_id.date": 1,  // Finally by date
                },
            },
        ]);

        // If no expenses found, handle the case
        if (dailyExpense.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No expenses found for the given user in the last month",
            });
        }

        // Send success response with data
        res.status(200).json({
            success: true,
            message: "Daily expenses retrieved successfully",
            data: dailyExpense,
        });
    } catch (err) {
        // Log the error and send error response
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
User Monthly Expense Function 
This function is used to get the monthly amount spend by a user
Accepts : Email Id 
Returns : Expense per month
*/
export const userMonthlyExpense = async (req, res) => {
    try {
        const { user: userEmail } = req.body;

        // Validate input
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "User email is required",
            });
        }

        // Aggregate pipeline to calculate monthly expenses
        const monthlyExpense = await model.Expense.aggregate([
            {
                $match: {
                    expenseMembers: userEmail, // Match user email in expenseMembers array
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$expenseDate" }, // Extract month from expenseDate
                        year: { $year: "$expenseDate" },   // Extract year from expenseDate
                    },
                    amount: { $sum: "$expensePerMember" }, // Sum of expensePerMember for each month
                },
            },
            {
                $sort: {
                    "_id.year": 1,  // Sort by year
                    "_id.month": 1, // Then by month
                },
            },
        ]);

        // If no expenses found, handle the case
        if (monthlyExpense.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No monthly expenses found for the given user",
            });
        }

        // Send success response with data
        res.status(200).json({
            success: true,
            message: "Monthly expenses retrieved successfully",
            data: monthlyExpense,
        });
    } catch (err) {
        // Log the error and send error response
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
Category wise user expense calculator function 
This function is used to retuen the expense spend on each category for a user
Accepts : emailID
Returns : Each category total exp (individaul Expense)
*/

export const userCategoryExpense = async (req, res) => {
    try {
        const { user: userEmail } = req.body;

        // Validate input
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "User email is required",
            });
        }

        // Aggregate pipeline to calculate category-wise expenses
        const categoryExpense = await model.Expense.aggregate([
            {
                $match: {
                    expenseMembers: userEmail, // Match user email in expenseMembers array
                },
            },
            {
                $group: {
                    _id: "$expenseCategory", // Group by expenseCategory
                    amount: { $sum: "$expensePerMember" }, // Sum of expensePerMember for each category
                },
            },
            {
                $sort: {
                    _id: 1, // Sort categories in ascending order
                },
            },
        ]);

        // If no category expenses found, handle the case
        if (categoryExpense.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No category expenses found for the given user",
            });
        }

        // Send success response with data
        res.status(200).json({
            success: true,
            message: "Category-wise expenses retrieved successfully",
            data: categoryExpense,
        });
    } catch (err) {
        // Log the error and send error response
        logger.error(
            `URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`
        );
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};

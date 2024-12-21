import * as api from '../api/index'
import configData from '../config.json'

export const getUserExpenseService = async (data, setAlert, setAlertMessage) => {
    try {
        console.log("reached");
        console.log("Payload received in getRecentUserExpService:", data);
        const response = await api.getUserExpense(data)
        return response
    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const deleteExpenseService = async (data, setAlert, setAlertMessage) => {
    try {
        const delete_exp_response = await api.deleteExpense(data)
        return delete_exp_response
    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

/*
Delete Expense function
This function is used to deted the expense added to the group
Accepts: Group ID not null group ID exist in the DB 
         Expense ID not null expense ID exist in the DB for the perticular group
*/
export const deleteExpense = async (req, res) => {
    try {
        var expense = await model.Expense.findOne({
            _id: req.body.id
        })
        if (!expense) {
            var err = new Error("Invalid Expense Id")
            err.status = 400
            throw err
        }
        var deleteExp = await model.Expense.deleteOne({
            _id: req.body.id
        })

        //Clearing split value for the deleted expense from group table
        await gorupDAO.clearSplit(expense.groupId, expense.expenseAmount, expense.expenseOwner, expense.expenseMembers)

        res.status(200).json({
            status: "Success",
            message: "Expense is deleted",
            response: deleteExp
        })
    } catch (err) {

        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

export const getRecentUserExpService = async (data, setAlert, setAlertMessage) => {
    try {
        console.log("reached here");
        return await api.getRecentUserExp(data)
        console.log("reached here too ");
    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}
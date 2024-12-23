import * as api from '../api/index'
import configData from '../config.json'


export const addExpenseService = async (data, setAlert, setAlertMessage) => {
    try {
        const add_exp_response = await api.addExpense(data)
        return add_exp_response
    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

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
//TESTED
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

export const getExpDetailsService = async (data, setAlert, setAlertMessage) => {
    try {
        return await api.getExpDetails(data)
    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}



export const editExpenseService = async (data, setAlert, setAlertMessage) => {
    try {
        const edit_exp_response = await api.editExpense(data)
        return edit_exp_response
    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}


export const getGroupCategoryExpService = async (data, setAlert, setAlertMessage) => {
    try {
        return await api.getGroupCategoryExp(data)

    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const getUserDailyExpService = async (data, setAlert, setAlertMessage) => {
    try {
        return await api.getUserDailyExp(data)

    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const getUserMonthlyExpService = async (userId, setAlert, setAlertMessage) => {
    try {
        console.log(userId);
        return await api.getUserMonthlyExp(userId)

    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}
export const getUserCategoryExpService = async (data, setAlert, setAlertMessage) => {
    try {
        return await api.getUserCategoryExp(data)

    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const getGroupDailyExpService = async (data, setAlert, setAlertMessage) => {
    try {
        return await api.getGroupDailyExp(data)

    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const getGroupMonthlyExpService = async (data, setAlert, setAlertMessage) => {
    try {
        return await api.getGroupMonthlyExp(data)

    } catch (err) {
        setAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

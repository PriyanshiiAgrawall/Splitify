//for making api requests
//used for GET, POST, PUT, DELETE, etc., requests to back-end servers
import axios from 'axios'


//creating base url , instanciating axios
const API = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});

//profile looks somewhat like this 
// {
//     "user": {
//       "_id": "67633a9163fd4e93db2c74b7",
//       "name": "John Doe",
//       "email": "john.doe@example.com",
//       "createdAt": "2024-01-15T12:00:00.000Z",
//       "updatedAt": "2024-01-15T12:00:00.000Z"
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjMzYTkxNjNmZDRlOTNkYjJjNzRiNyIsImlhdCI6MTY4OTc3OTIwMH0.WgHkhvZoKsMHiIWdpdNZ9sTcMkaOXEY6bxoCm9PhCbA"
//   }

//profile.user , profile.accessToken

//option 1
//get user profile from local storage
const profile = JSON.parse(localStorage.getItem('profile'));
//if no profile found then it will be null



//to send token in each subsequest request


const puttingTokenInHeader = {
    headers: {
        'Authorization': `Bearer ${profile ? profile.accessToken : ''}`
    }
};



//this is backend url to which we are sending form data
export const loginIn = async (formData) => {
    try {
        const response = await API.post('/api/users/v1/login', formData);
        return response;
    } catch (error) {
        console.error("Error in loginIn API call:", error);
        throw error;
    }
};


export const register = (formData) => API.post('/api/users/v1/register', formData)

//USER ROUTES

// export const deleteUser = (formData) => API.delete('/api/users/v1/deleteuser', { headers: puttingTokenInHeader.headers, data: formData })

// export const updatePassword = (formData) => API.post('/api/users/v1/updatePassword', formData, puttingTokenInHeader)

export const getUser = (formData) => API.post('/api/users/v1/viewuser', formData, puttingTokenInHeader)

// export const editUser = (formData) => API.post('/api/users/v1/edit', formData, puttingTokenInHeader)

export const getEmailList = () => API.get('/api/users/v1/fetchAllRegisteredEmails', puttingTokenInHeader)

//GROUP ROUTES

export const getUserGroups = (formData) => API.post('/api/group/v1/findusergroups', formData, puttingTokenInHeader)

export const createGroup = (formData) => API.post('/api/group/v1/creategroup', formData, puttingTokenInHeader)

export const editGroup = (formData) => API.post('/api/group/v1/editgroup', formData, puttingTokenInHeader)

export const getGroupDetails = (formData) => API.post('/api/group/v1/viewgroup', formData, puttingTokenInHeader)

export const getSettle = (formData) => API.post('/api/group/v1/groupBalanceSheet', formData, puttingTokenInHeader)

export const makeSettle = (formData) => API.post('/api/group/v1/makeSettlement', formData, puttingTokenInHeader)

//EXPENSES ROUTES

export const getGroupExpense = (formData) => API.post('/api/expense/v1/viewgroupexpense', formData, puttingTokenInHeader)

export const addExpense = (formDate) => API.post('/api/expense/v1/addexpense', formDate, puttingTokenInHeader)

export const editExpense = (formDate) => API.post('/api/expense/v1/editexpense', formDate, puttingTokenInHeader)

export const deleteExpense = (formData) => API.delete('/api/expense/v1/deleteexpense', { headers: puttingTokenInHeader.headers, data: formData })

// export const getGroupCategoryExp = (formData) => API.post('/api/expense/v1/group/categoryExp', formData, puttingTokenInHeader)

// export const getGroupMonthlyExp = (formData) => API.post('/api/expense/v1/group/monthlyExp', formData, puttingTokenInHeader)

// export const getGroupDailyExp = (formData) => API.post('/api/expense/v1/group/dailyExp', formData, puttingTokenInHeader)

export const getUserExpense = async (formData) => {
    try {
        const response = await API.get('/api/expense/v1/viewuserexpense', formData, puttingTokenInHeader);
        return response; // Return the response's data property directly
    } catch (error) {
        console.error("Error in getUserExpense API call:", error);
        throw error; // Rethrow the error for the caller to handle
    }
};


// export const getUserMonthlyExp = (formData) => API.post('/api/expense/v1/user/monthlyExp', formData, puttingTokenInHeader)

// export const getUserDailyExp = (formData) => API.post('/api/expense/v1/user/dailyExp', formData, puttingTokenInHeader)

// export const getUserCategoryExp = (formData) => API.post('/api/expense/v1/user/categoryExp', formData, puttingTokenInHeader)

//http://localhost:3001/api/expense/v1/recentuserexpense
export const getRecentUserExp = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/recentuserexpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}` // Ensure token is directly set
            },
            params: queryParams, // Query parameters
        });

        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in getRecentUserExp API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};


export const getExpDetails = (formData) => API.post('/api/expense/v1/viewexpense', formData, puttingTokenInHeader)


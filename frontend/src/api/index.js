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


export const deleteUser = async (formData) => {
    try {
        console.log("Sending API Request with payload:", formData);
        console.log("Access Token:", profile?.accessToken);

        const response = await API.delete('/api/users/v1/deleteUser', {
            headers: {
                Authorization: `Bearer ${profile?.accessToken}`,
            },
            data: formData,
        });

        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in deleteUser API call:", error.response || error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }

        throw error;
    }
};

export const getUser = async (queryParams) => {
    try {

        console.log(profile.accessToken);
        queryParams = { queryParams }
        console.log(queryParams)
        const response = await API.get('/api/users/v1/viewUser', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams
        });

        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in getRecentUserExp API call:", error.response || error.message);

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};



export const updatePassword = async (formData) => {
    try {

        console.log("Sending API Request with payload:", formData);
        console.log(profile.accessToken);
        const response = await API.post('/api/users/v1/updatePassword', formData, {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`,
            },
        });
        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in addExpense API call:", error.response || error.message);

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};



export const editUser = async (formData) => {
    try {

        console.log("Sending API Request with payload:", formData);
        console.log(formData)
        console.log(profile.accessToken);
        const response = await API.post('/api/users/v1/editUser', formData, {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`,
            },
        });
        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in addExpense API call:", error.response || error.message);

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};






export const getEmailList = async () => {
    try {

        console.log(profile.accessToken);
        const response = await API.get('/api/users/v1/fetchAllRegisteredEmails', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            }
        });

        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in getRecentUserExp API call:", error.response || error.message);

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};
//GROUP ROUTES




export const getUserGroups = async (userId) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:", { userId });
        console.log(profile.accessToken);
        const response = await API.get('/api/groups/v1/findusergroups', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: { userId }, //userId is send here
        });

        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in getRecentUserExp API call:", error.response || error.message);

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};

export const createGroup = async (formData) => {
    try {

        console.log("Sending API Request with payload:", formData);
        console.log(profile.accessToken);
        const response = await API.post('/api/groups/v1/creategroup', formData, {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`,
            },
        });
        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in addExpense API call:", error.response || error.message);

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};


export const editGroup = async (formData) => {
    try {

        console.log("Sending API Request with payload:", formData);
        console.log(profile.accessToken);
        const response = await API.post('/api/groups/v1/editgroup', formData, {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`,
            },
        });
        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in addExpense API call:", error.response || error.message);

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};


export const getGroupDetails = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:1234", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/groups/v1/viewgroup', {
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


export const getSettle = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/groups/v1/groupBalanceSheet', {
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
export const makeSettle = async (formData) => {
    try {
        console.log("Sending API Request with payload:", formData);
        console.log(profile.accessToken);
        const response = await API.post('/api/groups/v1/makeSettlement', formData, {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`,
            },
        });
        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in addExpense API call:", error.response || error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};

export const deleteGroup = async (formData) => {
    try {
        console.log("Sending API Request with payload:", formData);
        console.log("Access Token:", profile?.accessToken);

        const response = await API.delete('/api/groups/v1/deletegroup', {
            headers: {
                Authorization: `Bearer ${profile?.accessToken}`,
            },
            data: formData,
        });

        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in deleteUser API call:", error.response || error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }

        throw error;
    }
};



//EXPENSES ROUTES



export const getGroupExpense = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:1234", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/viewgroupexpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
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

export const addExpense = async (formData) => {
    try {
        console.log("Sending API Request with payload:", formData);
        console.log(profile.accessToken);
        const response = await API.post('/api/expense/v1/addexpense', formData, {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`,
            },
        });
        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in addExpense API call:", error.response || error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error;
    }
};

export const editExpense = async (formData) => {
    try {
        // Log the payload being sent for debugging
        console.log("Sending API Request with payload:", formData);
        console.log(profile.accessToken);

        // Make the POST request to the backend
        const response = await API.post('/api/expense/v1/editexpense', formData, {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`, // Attach token to headers
            },
        });

        // Log the API response for debugging
        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in editExpense API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};

export const deleteExpense = async (formData) => {
    try {
        console.log("Sending API Request with payload:", formData);
        console.log("Access Token:", profile?.accessToken);

        const response = await API.delete('/api/expense/v1/deleteexpense', {
            headers: {
                Authorization: `Bearer ${profile?.accessToken}`,
            },
            data: formData,
        });

        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error in deleteUser API call:", error.response || error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }

        throw error;
    }
};



export const getGroupCategoryExp = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:1234", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/groupCategoryExpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams, // Query parameters
        });

        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in getGroupCategoryExp API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};

export const getGroupMonthlyExp = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:1234", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/groupMonthlyExpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams, // Query parameters
        });

        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in getUserCategoryExp API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};


export const getGroupDailyExp = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:1234", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/groupDailyExpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams, // Query parameters
        });

        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in getUserDailyExpense API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};

export const getUserExpense = async (queryParams) => {
    try {
        const response = await API.get('/api/expense/v1/viewuserexpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams,


        })
        return response; // Return the response's data property directly
    } catch (error) {
        console.error("Error in getUserExpense API call:", error);
        throw error; // Rethrow the error for the caller to handle
    }
};



export const getUserMonthlyExp = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:1234", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/userMonthlyExpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams, // Query parameters
        });

        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in getUserCategoryExp API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};

export const getUserDailyExp = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/userDailyExpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams, // Query parameters
        });

        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in getUserDailyExpense API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};

export const getUserCategoryExp = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:1234", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/userCategoryExpense', {
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`
            },
            params: queryParams, // Query parameters
        });

        console.log("API Response:", response.data);
        return response; // Return the response directly
    } catch (error) {
        console.error("Error in getUserCategoryExp API call:", error.response || error.message);

        if (error.response) {
            // Log details for better debugging
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        }
        throw error; // Rethrow the error for the caller to handle
    }
};






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

export const getExpDetails = async (queryParams) => {
    try {
        // Use queryParams directly in the params
        console.log("Sending API Request with params:", queryParams);
        console.log(profile.accessToken);
        const response = await API.get('/api/expense/v1/viewexpense', {
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



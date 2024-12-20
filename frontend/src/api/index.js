//for making api requests
//used for GET, POST, PUT, DELETE, etc., requests to back-end servers
import axios from 'axios'


//creating base url , instanciating axios
const API = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});


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
    await API.post('/api/users/v1/login', formData);
}

export const register = (formData) => API.post('/api/users/v1/register', formData)


export const getUserExpense = (formData) => API.post('/api/expense/v1/user', formData, puttingTokenInHeader)


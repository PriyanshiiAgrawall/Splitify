import * as api from '../api/index'
import configData from '../config.json'

export const login = async (formData, setAlertMessage, setShowAlert) => {
    try {

        const { data } = await api.loginIn(formData)

        console.log(data);
        const cookies = document.cookie;
        console.log("Cookies:", cookies);

        const profile = {
            user: data.user,
            accessToken: data.accessToken
        }
        console.log("Profile to save in localStorage:", profile);
        //backend sends user obj and token and we save it in local storage
        localStorage.setItem("profile", JSON.stringify(profile))
        console.log("Profile successfully saved in localStorage");
        // window.location.href = configData.DASHBOARD_URL
        return data
    } catch (err) {
        setShowAlert(true)
        // Handle specific HTTP error responses
        if (err.response) {
            // Backend responded with a status code outside the 2xx range
            const { status, data } = err.response;
            if (status === 400 || status === 401) {
                setAlertMessage(data.message || "Invalid credentials provided");
            } else {
                setAlertMessage("Oops! Something went wrong");
            }
        } else if (err.request) {
            // No response received from the backend
            setAlertMessage("Network error: Unable to reach the server");
        } else {
            // Other errors (e.g., request setup issues)
            setAlertMessage("An unexpected error occurred");
        }
        return false
    }
}

export const register = async (formData, setShowAlert, setAlertMessage) => {
    try {
        //registering user to the DB
        const { data } = await api.register(formData)
        login(formData, setShowAlert, setAlertMessage)
        return data
    } catch (err) {
        setShowAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const logout = () => {
    localStorage.removeItem("profile");
    //remove token from cookie 
    window.location.href = configData.LOGIN_URL
}

export const getUser = async (formData, setShowAlert, setAlertMessage) => {
    try {
        //registering user to the DB
        const data = await api.getUser(formData)
        return data
    } catch (err) {
        setShowAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const deleteUser = async (data, setShowAlert, setAlertMessage, setAlertSeverity) => {
    try {
        const response = await api.deleteUser(data)
        localStorage.removeItem("profile")
        window.location.href = configData.USER_DELETED_URL
    } catch (err) {
        setShowAlert(true)
        setAlertSeverity('error');
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")


        return false
    }
}

export const updatePassword = async (formData, setShowAlert, setAlertMessage, showHomeAlert, homeAlertMessage) => {
    try {
        //registering user to the DB
        const { data } = await api.updatePassword(formData)
        showHomeAlert(true)
        homeAlertMessage("Password Updated Sucessfully!")
        return true
    } catch (err) {
        setShowAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const editUser = async (formData, setShowAlert, setAlertMessage, showHomeAlert, homeAlertMessage) => {
    try {
        //registering user to the DB
        const { data } = await api.editUser(formData)
        showHomeAlert(true)
        homeAlertMessage("User Updated Sucessfully!")
        return true
    } catch (err) {
        setShowAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
        return false
    }
}

export const getEmailList = async () => {
    try {
        const data = await api.getEmailList()
        return data
    } catch (err) {
        return null
    }
}

import * as api from '../api/index'
import configData from '../config.json'

export const login = async (formData, setAlertMessage, setShowAlert) => {
    try {
        //data is the entire payload from backend
        const { data } = await api.loginIn(formData)
        console.log(data);
        //backend sends user obj and token and we save it in local storage
        localStorage.setItem("profile", JSON.stringify(data))

        window.location.href = configData.DASHBOARD_URL
        return data
    } catch (err) {
        setShowAlert(true)
        err.response.status === 400 || err.response.status === 401
            ? setAlertMessage(err.response.data.message) : setAlertMessage("Oops! Something went worng")
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
    window.location.href = configData.LOGIN_URL
}
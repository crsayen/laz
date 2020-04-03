const setExp = (userExp) => {
    return {
        type: "SET_EXP",
        payload: userExp
    }
}

const setLogout = () => {
    return {
        type: "SET_LOGOUT",
    }
}

const setUser = (user) => {
    return {
        type: "SET_USER",
        payload: user
    }
}

const setToken = (userToken) => {
    return {
        type: "SET_TOKEN",
        payload: userToken
    }
}

const setLoading = (userLoading) => {
    return {
        type: "SET_LOADING",
        payload: userLoading
    }
}

const setAuth = (userAuth) => {
    return {
        type: "SET_AUTH",
        payload: userAuth
    }
}

export default {
    setExp,
    setLogout,
    setToken,
    setUser,
    setLoading,
    setAuth
}

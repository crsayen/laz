const exp = (state = {}, action) => {
    switch (action.type) {
        case "SET_EXP":
            return {
                ...state,
                exp: action.payload
            }
            case "SET_AUTH":
                return {
                    ...state,
                    auth: action.payload
                }
            case "SET_USER":
            return {
                ...state,
                user: action.payload
            }
            case "SET_TOKEN":
            return {
                ...state,
                token: action.payload
            }
            case "SET_Loading":
                return {
                    ...state,
                    loading: action.payload
                }
        case "SET_LOGOUT":
            return {
                ...state,
                exp: {},
                auth: false,
                user: {},
                token: {},
                loading: false
            }
        default:
            return state
    }
}

export default exp;


import exp from './exp'
import {combineReducers} from 'redux'
import storage from 'redux-persist/lib/storage'

const appReducer = combineReducers({
    exp,
})

const rootReducer = (state, action) => {  
    if (action === "SET_LOGOUT") {
      storage.removeItem("persist:root")
      state = undefined
    }
    return appReducer(state, action)
  }

export default rootReducer
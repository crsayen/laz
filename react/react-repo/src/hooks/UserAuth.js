import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, batch } from 'react-redux'
import jwt from "jsonwebtoken";
import allActions from '../actions'

const instance = axios.create({

});

function alert(data) {
  Swal.fire({
    title: 'Error',
    text: data,
    icon: 'warning',
    showCancelButton: false,
    confirmButtonText: 'Ok',
  }).then((result) => {

  })
};

export default function useLoginHandler(history) {
  console.log('i hit login')
  const dispatch = useDispatch();

  return {
    onLogin(login, password) {

      async function AsyncFunc(login, password) {

          dispatch(allActions.expAction.setLoading(true))

        return instance.post("/api/user/signin/local", { email: login, password }, { username: login, password: password })

      }
      //persistor.purge();
      AsyncFunc(login, password).then(res => {
        let user;
        const token = res.data.token;
        const expire = res.data.expire
        user = jwt.decode(token).user;
        delete user.id;
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        batch(() => {
          dispatch(allActions.expAction.setAuth(true))
          dispatch(allActions.expAction.setExp(expire))
          dispatch(allActions.expAction.setUser(user))
          dispatch(allActions.expAction.setToken(token))
        })
        history.push('/app/dashboard')
      }).catch((error) => {
        console.log(error)
        dispatch(allActions.expAction.setLoading(false))
        alert('Invalid username or password. Please try again.');
      })
    },
    onLogout() {
      dispatch(allActions.expAction.setLoading(false))
      dispatch(allActions.expAction.setLogout())
      document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      history.push("/login");
    },
  }
}

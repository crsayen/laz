import axios from "axios";
import Swal from 'sweetalert2'
import jwt from "jsonwebtoken";


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

export default function useLoginHandler() {
  console.log('i hit login')


  return {
    checkLoggedIn(cb) {
      console.log("checkLoggedIn")
      instance.get('/api/user/validate')
        .then(res => {
          console.log('checkLoggedInCallback', res.data)
          cb(res.data)
        })
    },
    onLogin(login, password) {
      console.log("onLogin")
      instance.post("/api/user/signin/local", {username: login, password: password})
    },
    onLogout() {
      document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    },
  }
}

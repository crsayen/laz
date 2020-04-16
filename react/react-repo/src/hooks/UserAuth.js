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

export default function useLoginHandler(history) {
  console.log('i hit login')


  return {
    onLogin(login, password) {
      const postCredsLocal = async (login, password) =>
        instance.post("/api/user/signin/local", {username: login, password: password})
      postCredsLocal(login, password)
    },
    onLogout() {
      document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      history.push("/login");
    },
  }
}

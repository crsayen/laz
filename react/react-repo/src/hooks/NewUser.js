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
  console.log('i hit new user')


  return {
    onNewUser(login, password) {

      async function AsyncFunc(login, password) {

        return instance.post("/api/user/signin/local", { email: login, password }, { username: login, password: password })

      }
      AsyncFunc(login, password).then(res => {
        let user;
        const token = res.data.token;
        user = jwt.decode(token).user;
        delete user.id;
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        history.push('/app/dashboard')
      }).catch((error) => {
        console.log(error)
        alert('Invalid username or password. Please try again.');
      })
    },
    onLogout() {
      document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      history.push("/login");
    },
  }
}

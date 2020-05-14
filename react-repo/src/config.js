const hostApi = "http://localhost"
const portApi = process.env.NODE_ENV === "development" ? 8080 : "";
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}`;

export default {
  hostApi,
  portApi,
  baseURLApi,
  remote: "http://localhost",
  isBackend: process.env.REACT_APP_BACKEND,
  auth: {
    email: "admin@rs-ll.com",
    password: "password"
  }
};

const hostApi = "http://35.223.229.47"
const portApi = process.env.NODE_ENV === "development" ? 8080 : "";
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}`;

export default {
  hostApi,
  portApi,
  baseURLApi,
  remote: "http://35.223.229.47",
  isBackend: process.env.REACT_APP_BACKEND,
  auth: {
    email: "admin@rs-ll.com",
    password: "password"
  }
};

var config = {
  admin_pass: "password",
  admin_email: "admin@rs-ll.com",
  secret_key: "HUEyqESqgQ1yTwzVlO6wprC9Kf1J1xuA",
  port: "8080",
  hostUI: "http://35.223.229.47",
  portUI: process.env.NODE_ENV === "production" ? "" : "3000",
};
config.host = "";
config.apiUrl = `${config.host}${config.port ? `:${config.port}` : ``}`;

module.exports = config;
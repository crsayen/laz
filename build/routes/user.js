"use strict";

var _express = _interopRequireDefault(require("express"));

var _helpers = _interopRequireDefault(require("../helpers/helpers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.post('/signin/local', function (req, res) {
  var body = {
    id: "user",
    email: "user@email.com"
  };
  var user = body;

  var token = _helpers["default"].jwtSign({
    user: body
  });

  var expire = Date.now() + 18000000000;
  res.json({
    user: user,
    success: true,
    token: token,
    expire: expire
  });
});
module.exports = router;
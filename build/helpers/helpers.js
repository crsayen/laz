"use strict";

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var jwtSign = function jwtSign(data) {
  return _jsonwebtoken["default"].sign(data, _config["default"].secret_key, {
    expiresIn: '6h'
  });
};

module.exports = {
  jwtSign: jwtSign
};
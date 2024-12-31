// 用户登录
let dbserver = require("../dao/dbserver");
let jwt = require("../utils/jwt");

// 登录
exports.signIn = function (req, res) {
  let data = req.body.data;
  let password = req.body.password;
  dbserver.userMatch(data, password, res);
};

//登录测试
exports.test = function (req, res) {
  let token = req.body.token;
  let jg = jwt.verifyToken(token);
  res.send(jg);
  // res.send("dsss");
};

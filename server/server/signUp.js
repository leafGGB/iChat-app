let dbserver = require("../dao/dbserver");
let email = require("../dao/emailServer");

//用户注册
exports.signUp = function (req, res) {
  let name = req.body.name;
  let mail = req.body.mail;
  let password = req.body.password;
  // console.log("注册成功");
  // res.send({ name, mail, password });

  // 发送邮件
  email.emailSignUp(mail, res);

  dbserver.createUser(name, mail, password, res);
};

//用户或邮箱是否占用判断
exports.judgeValue = function (req, res) {
  let data = req.body.data;
  let type = req.body.type;
  // res.send({ data, type });

  dbserver.countUserValue(data, type, res);
};

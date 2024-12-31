//用户详情
var dbserver = require("../dao/dbserver");

//详情
exports.userDetial = function (req, res) {
  let id = req.body.id;
  dbserver.userDetial(id, res);
};

//用户信息修改
exports.userUpdate = function (req, res) {
  let data = req.body;
  // console.log(data);
  dbserver.userUpdate(data, res);
};

//获取好友昵称
exports.getNickname = function (req, res) {
  let data = req.body;
  dbserver.getNickname(data, res);
};

//修改好友昵称
exports.alterNickname = function (req, res) {
  let data = req.body;
  dbserver.alterNickname(data, res);
};

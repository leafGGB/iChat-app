//主页
var dbserver = require("../dao/dbserver");

//获取好友列表
exports.getFriends = function (req, res) {
  let data = req.body;
  // dbserver.getUsers88(data, res);
  // console.log("数据体: ");
  // console.log(data);
  // 从搜索页面搜索用户时statue为1，此时需要单独调用噶接口
  if (data.state == 0) {
    dbserver.getUsers(data, res);
  } else if (data.state == 1) {
    dbserver.getUsers88(data, res);
  }
};

//获取最后一条l留言
exports.getLastMsg = function (req, res) {
  let data = req.body;
  dbserver.getOneMsg1(data, res);
};

//获取好友未读消息数
exports.unreadMsg = function (req, res) {
  let data = req.body;
  dbserver.unreadMsg(data, res);
};

// 设置好友消息已读
exports.readUnreadMsg = function (req, res) {
  let data = req.body;
  dbserver.readUnreadMsg(data, res);
};

//获取群列表
exports.getGroups = function (req, res) {
  let uid = req.body.uid;
  dbserver.getGroups(uid, res);
};

//获取最后一条群消息
exports.getOneGroupMsg = function (req, res) {
  let gid = req.body.gid;
  dbserver.getOneGroupMsg(gid, res);
};

//设置群消息已读
exports.readUnreadGroupMsg = function (req, res) {
  let data = req.body;
  dbserver.readUnreadGroupMsg(data, res);
};

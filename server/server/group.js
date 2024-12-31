// 群聊
var dbserver = require("../dao/dbserver");

// 新建群
exports.createGroup = function (req, res) {
  let data = req.body;
  dbserver.createGroup(data, res);
};

// 邀请好友进群
exports.inviteFriend = function (req, res) {
  let data = req.body;
  dbserver.inviteFriend(data, res);
};

// 添加群消息
exports.insertGroupMsg = function (req, res) {
  let data = req.body;
  dbserver.insertGroupMsg(data.gid, data.uid, data.message, data.type, res);
};

// 获取群成员列表及聊天信息
exports.getGroupUserLst = function (req, res) {
  let data = req.body;
  dbserver.getGroupUserLst(data.gid, res);
};

// 获取群聊信息
exports.getGroupMessages = function (req, res) {
  let data = req.body;
  dbserver.getGroupMessages(data, res);
};

// 获取群详细信息
exports.getGroupInfo = function (req, res) {
  let data = req.body.gid;
  dbserver.getGroupInfo(data, res);
};

// 删除群成员
exports.deleteGroupMember = function (req, res) {
  let data = req.body;
  dbserver.deleteGroupMember(data, res);
};

// 解散群聊
exports.deleteGroup = function (req, res) {
  let data = req.body;
  dbserver.deleteGroup(data, res);
};

// 群信息修改
exports.GroupUpdate = function (req, res) {
  let data = req.body;
  dbserver.GroupUpdate(data, res);
};

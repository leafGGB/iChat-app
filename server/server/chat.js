// 聊天页面

var dbserver = require("../dao/dbserver");

// 获取私聊数据
exports.message = function (req, res) {
  let data = req.body;
  dbserver.message(data, res);
};

let mongoose = require("mongoose");
let db = require("../config/db");
const Schema = mongoose.Schema;

// 用户表
var UserSchema = new Schema({
  name: { type: String }, //用户名
  password: { type: String }, //密码
  email: { type: String }, //邮箱
  sex: { type: String, default: "asexual" }, //性别
  birth: { type: Date }, //生日
  phone: { type: Number }, //电话
  explain: { type: String }, //介绍
  imgUrl: { type: String, default: "/user/user.png" }, //用户头像
  registerTime: { type: Date }, //注册时间
});

// 好友表
var FriendSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, // 用户ID
  friendID: { type: Schema.Types.ObjectId, ref: "User" }, // 好友ID
  state: { type: String }, // 好友状态（0：已为好友；1：给对方发送的好友请求；2：对方发送给我的好友请求）
  markname: { type: String }, // 好友昵称
  time: { type: Date }, // 生成时间
  lastTime: { type: Date }, // 最后一条消息时间
});

// 一对一消息表
var MessageSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, // 用户ID
  friendID: { type: Schema.Types.ObjectId, ref: "User" }, // 好友ID
  message: { type: String }, // 内容
  types: { type: String }, // 内容类型（0：文字；1：图片链接；2：音频链接）
  time: { type: Date }, // 发送时间
  state: { type: Number }, // 消息状态（0：已读；1：未读）
});

//群表
var GroupSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //群主id
  groupName: { type: String }, //群名称
  imgUrl: { type: String, default: "group/group.png" }, //群头像
  time: { type: Date }, //创建时间
  notice: { type: String }, //公告
});

//群成员表
var GroupUserSchema = new Schema({
  groupID: { type: Schema.Types.ObjectId, ref: "Group" }, //群id
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  name: { type: String }, //群内名称
  tip: { type: Number, default: 0 }, //未读消息数
  time: { type: Date }, //加入时间
  lastTime: { type: Date }, // 最后一条消息时间
  shield: { type: Number }, //是否屏蔽群消息(0不屏蔽，1屏蔽)
});

//群消息表
var GroupMsgSchema = new Schema({
  groupID: { type: Schema.Types.ObjectId, ref: "Group" }, //群id
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  message: { type: String }, // 内容
  types: { type: String }, // 内容类型（0：文字；1：图片链接；2：音频链接）
  time: { type: Date }, // 发送时间
});

module.exports = db.model("User", UserSchema);
module.exports = db.model("Friend", FriendSchema);
module.exports = db.model("Message", MessageSchema);
module.exports = db.model("Group", GroupSchema);
module.exports = db.model("GroupUser", GroupUserSchema);
module.exports = db.model("GroupMsg", GroupMsgSchema);

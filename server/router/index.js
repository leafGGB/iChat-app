let dbserver = require("../dao/dbserver");
// 引入邮箱发送方法
let emailServer = require("../dao/emailServer");
// 注册页面
let signup = require("../server/signUp");
// 登录页面
let signin = require("../server/signIn");
// 搜索页面
let search = require("../server/search");
// 用户详细信息
let userDetail = require("../server/userDetail");
// 好友操作
let friends = require("../server/friend");
// 主页
let homePage = require("../server/homePage");
// 聊天
let chatPage = require("../server/chat.js");
// 群聊
let group = require("../server/group.js");

module.exports = function (app) {
  app.get("/test", (req, res) => {
    dbserver.findUser(res);
    // res.send("asddasd");
  });

  // 邮箱测试
  app.post("/mail", (req, res) => {
    let mail = req.body.mail;
    emailServer.emailSignUp(mail, res);
    // res.send(mail);
    // console.log(mail);
  });

  // 注册页面
  // 注册
  app.post("/signup/register", (req, res) => {
    signup.signUp(req, res);
  });

  //用户或邮箱是否占用判断
  app.post("/signup/judge", (req, res) => {
    signup.judgeValue(req, res);
  });

  // 登录
  app.post("/signin/login", (req, res) => {
    signin.signIn(req, res);
  });

  // 搜索用户
  app.post("/search/user", (req, res) => {
    search.searchUser(req, res);
  });

  // 判断是否为好友
  app.post("/search/isFriend", (req, res) => {
    search.isFriend(req, res);
  });

  // 搜索群
  app.post("/search/group", (req, res) => {
    search.searchGroup(req, res);
  });

  // 判断是否在群里
  app.post("/search/isInGroup", (req, res) => {
    search.isInGroup(req, res);
  });

  // 用户详细信息
  // 详情
  app.post("/user/detail", (req, res) => {
    userDetail.userDetial(req, res);
  });

  // 用户信息修改
  app.post("/user/update", (req, res) => {
    userDetail.userUpdate(req, res);
  });

  // 获取好友昵称
  app.post("/user/getNickname", (req, res) => {
    userDetail.getNickname(req, res);
  });

  // 修改好友昵称
  app.post("/user/alterNickname", (req, res) => {
    userDetail.alterNickname(req, res);
  });

  // 好友操作
  // 申请好友
  app.post("/friend/applyFriend", (req, res) => {
    friends.applyFriend(req, res);
  });

  // 申请状态修改
  app.post("/friend/updateFriendState", (req, res) => {
    friends.updateFriendState(req, res);
  });

  // 拒绝好友请求 / 删除好友
  app.post("/friend/deleteFriend", (req, res) => {
    friends.deleteFriend(req, res);
  });

  // 主页
  // 获取好友列表
  app.post("/home/getFriends", (req, res) => {
    homePage.getFriends(req, res);
  });

  //获取最后一条留言
  app.post("/home/getLastMsg", (req, res) => {
    homePage.getLastMsg(req, res);
  });

  ////获取好友未读消息数
  app.post("/home/unreadMsg", (req, res) => {
    homePage.unreadMsg(req, res);
  });

  // 设置好友消息已读
  app.post("/home/readUnreadMsg", (req, res) => {
    homePage.readUnreadMsg(req, res);
  });

  // 群
  //建群
  app.post("/group/createGroup", (req, res) => {
    group.createGroup(req, res);
  });

  //邀请好友进群
  app.post("/group/inviteFriend", (req, res) => {
    group.inviteFriend(req, res);
  });

  // 添加群消息
  app.post("/group/insertGroupMsg", (req, res) => {
    group.insertGroupMsg(req, res);
  });

  // 获取群列表
  app.post("/home/getGroups", (req, res) => {
    homePage.getGroups(req, res);
  });

  // 获取群成员列表及详细信息
  app.post("/group/getGroupUserLst", (req, res) => {
    group.getGroupUserLst(req, res);
  });

  //获取最后一条群消息
  app.post("/home/getOneGroupMsg", (req, res) => {
    homePage.getOneGroupMsg(req, res);
  });

  // 设置群消息已读
  app.post("/home/readUnreadGroupMsg", (req, res) => {
    homePage.readUnreadGroupMsg(req, res);
  });

  // 聊天
  // 获取私聊数据
  app.post("/chat/message", (req, res) => {
    chatPage.message(req, res);
  });

  // 获取群数据
  app.post("/chat/groupMessage", (req, res) => {
    group.getGroupMessages(req, res);
  });

  // 获取群详细信息
  app.post("/group/getGroupInfo", (req, res) => {
    group.getGroupInfo(req, res);
  });

  // 删除群成员
  app.post("/group/deleteGroupMember", (req, res) => {
    group.deleteGroupMember(req, res);
  });

  // 解散群聊
  app.post("/group/deleteGroup", (req, res) => {
    group.deleteGroup(req, res);
  });

  // 群信息修改
  app.post("/group/GroupUpdate", (req, res) => {
    group.GroupUpdate(req, res);
  });

  // 测试token
  app.post("/signin/test", (req, res) => {
    // signin.test(req, res);
    res.send("token正确");
  });
};

let dbserver = require("./dbserver");

module.exports = function (io) {
  let users = {}; // socket 注册用户

  io.on("connection", (socket) => {
    // 用户登录时注册socket
    socket.on("login", (id) => {
      // console.log(socket.id);
      //   回复客户端
      socket.emit("login", socket.id);
      socket.name = id;
      users[id] = socket.id;
    });

    // 用户私聊消息接收
    socket.on("msg", (msg, fromid, toid) => {
      console.log(msg);
      // 修改好友最后通讯时间
      dbserver.upFriendLastTime({ uid: fromid, fid: toid });
      // 存储私聊消息
      dbserver.insertMsg(fromid, toid, msg.message, msg.types);

      //   回复客户端
      // 发送给对方
      if (users[toid]) {
        socket.to(users[toid]).emit("msg", msg, fromid, 0);
      }
      // 发送给自己
      socket.emit("msg", msg, toid, 1);
    });

    // 用户离开
    socket.on("disconnecting", () => {
      if (users.hasOwnProperty(socket.name)) {
        delete users[socket.name];
        // console.log(socket.id + "离开");
      }
    });

    // 加入群
    socket.on("group", function (data) {
      // console.log(data);
      socket.join(data);
    });

    // 接收群消息
    socket.on("groupMsg", function (msg, fromid, gid, name, headPortrait) {
      // 存储私聊消息
      dbserver.insertGroupMsg(gid, fromid, msg.message, msg.types);
      // 群内广播消息
      socket.to(gid).emit("groupmsg", msg, fromid, gid, name, headPortrait, 0);
      socket.emit("groupmsg", msg, fromid, gid, name, headPortrait, 1);
    });

    // 告知离开当前聊天页面，清除未读消息
    socket.on("leaveChatRoom", function (uid, fid) {
      dbserver.readUnreadMsg(fid, uid);
      socket.emit("leaveChat", uid, fid);
    });
  });
};

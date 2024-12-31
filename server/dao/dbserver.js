let dbmodel = require("../model/dbmodel");
const bcrypt = require("../dao/bcrypt");
// 引入token
let jwt = require("../utils/jwt");

let User = dbmodel.model("User");
let Friend = dbmodel.model("Friend");
let Group = dbmodel.model("Group");
let GroupUser = dbmodel.model("GroupUser");
let Message = dbmodel.model("Message");
let GroupMsg = dbmodel.model("GroupMsg");

//新建用户
exports.createUser = async function (name, mail, password, res) {
  let psw = bcrypt.encryption(password);

  let data = {
    name: name,
    email: mail,
    password: psw,
    registerTime: new Date(),
  };

  let user = new User(data);

  try {
    let result = await user.save();
    // res.status(200).send();
    res.send({ status: 200 });
  } catch (err) {
    // res.status(500).send();
    res.send({ status: 500 });
  }
};

// 匹配用户表元素个数
exports.countUserValue = async function (data, type, res) {
  try {
    let wherestr = {};
    wherestr[type] = data;

    const result = await User.countDocuments(wherestr).exec();
    res.send({ status: 200, result });
  } catch (err) {
    res.send({ status: 500 });
  }
};

// 用户验证
exports.userMatch = async function (data, password, res) {
  let wherestr = { $or: [{ name: data }, { email: data }] };
  let out = { name: 1, imgUrl: 1, password: 1 };

  try {
    const result = await User.find(wherestr, out);

    if (result.length === 0) {
      res.send({ status: 400 });
      return;
    }

    for (const e of result) {
      const pwdMatch = bcrypt.verification(password, e.password);
      if (pwdMatch) {
        let token = jwt.generateToken(e._id);
        let back = {
          id: e._id,
          name: e.name,
          imgUrl: e.imgUrl,
          token: token,
        };
        res.send({ status: 200, back });
        return; // 结束循环
      } else {
        res.send({ status: 400 });
        return; // 结束循环
      }
    }
    // 如果未匹配到用户，发送相应
    res.send({ status: 400 });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: 500 });
  }
};

//搜索用户
exports.searchUser = async function (data, res) {
  let wherestr;
  if (data == "wc") {
    wherestr = {};
  } else {
    wherestr = {
      $or: [{ name: { $regex: data } }, { email: { $regex: data } }],
    };
  }
  let out = {
    name: 1,
    email: 1,
    imgUrl: 1,
  };

  try {
    const result = await User.find(wherestr, out).exec();
    res.send({ status: 200, result });
  } catch (err) {
    res.send({ status: 500 });
  }

  // User.find(wherestr, out, function (err, result) {
  //   if (err) {
  //     res.send({ status: 500 });
  //   } else {
  //     res.send({ status: 200, result });
  //   }
  // });
};

//判断是否为好友
exports.isFriend = async function (uid, fid, res) {
  let wherestr = { userID: uid, friendID: fid, state: 0 };

  try {
    let result = await Friend.findOne(wherestr);
    console.log(result);
    if (result) {
      //是好友
      res.send({ status: 200 });
    } else {
      //不是好友
      res.send({ status: 400 });
    }
  } catch (error) {
    res.send({ status: 500 });
  }
};

//搜索群
exports.searchGroup = async function (data, res) {
  let wherestr;
  if (data == "yike") {
    wherestr = {};
  } else {
    wherestr = { name: { $regex: data } };
  }
  let out = {
    name: 1,
    imgurl: 1,
  };

  // try {
  //   const result = await Group.find(wherestr, out).exec();
  //   res.send({ status: 500 });

  // } catch (err) {
  //   res.send({ status: 500 });
  // }

  Group.find(wherestr, out, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result });
    }
  });
};

//判断是否在群内
exports.isInGroup = function (uid, gid, res) {
  let wherestr = { userID: uid, groupID: gid };
  GroupUser.find0ne(wherestr, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      if (result) {
        // 在群内
        res.send({ status: 200 });
      } else {
        // 不在群内
        res.send({ status: 400 });
      }
    }
  });
};

//用户详情
exports.userDetial = async function (id, res) {
  try {
    let wherestr = { _id: id };
    let out = { password: 0 };

    const result = await User.findOne(wherestr, out).exec();

    if (result) {
      res.send({ status: 200, result });
    } else {
      res.send({ status: 404, message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.send({ status: 500, message: "Internal Server Error" });
  }
};

// 修改用户信息数据库通用方法
async function update(id, update, res) {
  const updatedUser = await User.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (updatedUser) {
    // 修改成功
    return res.send({ status: 200 });
  } else {
    // 修改失败
    return res.send({ status: 500 });
  }
}

//用户信息修改
exports.userUpdate = async function (data, res) {
  // console.log(data);
  try {
    let updatestr = {};

    // 判断是否有密码
    if (typeof data.oldPassword != "undefined") {
      const result = await User.findOne({ _id: data.id });

      if (!result) {
        return res.send({ status: 400 });
      }

      const pwdMatch = await bcrypt.verification(
        data.oldPassword,
        result.password
      );

      if (pwdMatch) {
        // 密码验证成功
        // 如果是修改密码
        if (data.type == "password") {
          // 密码加密
          let password = bcrypt.encryption(data.newPassword);
          updatestr[data.type] = password;
          // 修改密码
          update(data.id, updatestr, res);
        } else {
          // 邮箱匹配
          updatestr[data.type] = data.data;
          try {
            const result = await User.countDocuments(updatestr).exec();
            if (result == 0) {
              // 邮箱没有冲突，可以修改邮箱
              update(data.id, updatestr, res);
            } else {
              // 邮箱已存在，无法更改
              console.log("上班");

              res.send({ status: 700 });
            }
          } catch (err) {
            res.send({ status: 500 });
          }
        }
      } else {
        // 密码匹配失败
        return res.send({ status: 400 });
      }
    } else {
      // 没有密码，其他项修改
      if (data.type == "phone") {
        if (data.data.length < 11) {
          res.send({ status: 600 });
        } else {
          updatestr[data.type] = data.data;
          // 修改数据库
          update(data.id, updatestr, res);
        }
      } else {
        updatestr[data.type] = data.data;
        // 修改数据库
        update(data.id, updatestr, res);
      }
      // updatestr[data.type] = data.data;
      // // 修改数据库
      // update(data.id, updatestr, res);
    }
  } catch (error) {
    console.error(error);
    res.send({ status: 500 });
  }
};

//获取好友昵称
exports.getNickname = async function (data, res) {
  try {
    let wherestr = { userID: data.uid, friendID: data.fid };
    let out = { markname: 1 };
    const result = await Friend.findOne(wherestr, out).exec();
    console.log(result);

    res.send({ status: 200, result });
  } catch (err) {
    res.send({ status: 500 });
  }

  // let wherestr = { userID: data.uid, "friendID ": data.fid };
  // let out = { markname: 1 };
  // Friend.findOne(wherestr, out, function (err, result) {
  //   if (err) {
  //     //获取失败
  //     res.send({ status: 500 });
  //   } else {
  //     //获取成功
  //     res.send({ status: 200, result });
  //   }
  // });
};

//修改好友昵称
exports.alterNickname = async function (data, res) {
  let wherestr = { userID: data.uid, friendID: data.fid };
  let updatestr = { markname: data.name };
  try {
    // console.log(data);
    let result = await Friend.updateOne(wherestr, updatestr);
    console.log(result);
    res.send({ status: 200 });
  } catch (error) {
    //修改失败
    console.error(error);
    res.send({ status: 500 });
  }
};

//好友操作
//添加好友表
exports.addFriend = async function (uid, fid, state, res) {
  let data = {
    userID: uid,
    friendID: fid,
    state: state,
    time: new Date(),
    lastTime: new Date(),
  };
  let friend = new Friend(data);

  try {
    let result = await friend.save();
    // res.send({ status: 200 });
  } catch (err) {
    // res.send({ status: 500 });
    console.log("添加好友出错");
  }
};

// 好友最后通讯时间
exports.upFriendLastTime = async function (data) {
  let wherestr = {
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  };
  let updatestr = { lastTime: new Date() };

  try {
    let result = await Friend.updateMany(wherestr, updatestr).exec(); // 修正方法名

    // res.send({ status: 200 });
  } catch (error) {
    // res.send({ status: 500 });
    console.log("更新好友最后通讯时间出错");
  }
};

//添加私聊消息
exports.insertMsg = async function (uid, fid, msg, type, res) {
  let data = {
    userID: uid, //用户id
    friendID: fid, //好友id
    message: msg, //内容
    types: type, //内容类型(0文字，1图片链接，2音频链接。..)
    time: new Date(), //发送时间
    state: 1, //消息状态(0已读，1未读)
  };
  let message = new Message(data);

  try {
    let result = await message.save();
    // res.status(200).send();
    if (res) {
      res.send({ status: 200 });
    }
  } catch (err) {
    if (res) {
      res.send({ status: 500 });
    }
  }
};

//好友申请
exports.applyFriend = async function (data, res) {
  try {
    // 判断是否已经申请过
    let wherestr = { userID: data.uid, friendID: data.fid };
    const result = await Friend.countDocuments(wherestr).exec();
    // console.log("qqqq" + result);
    if (result === 0) {
      this.addFriend(data.uid, data.fid, 2);
      this.addFriend(data.fid, data.uid, 1);
    } else {
      // 已经申请过好友
      await this.upFriendLastTime(data);
    }

    // 添加消息
    this.insertMsg(data.uid, data.fid, data.msg, 0, res);
  } catch (error) {
    res.send({ status: 500 });
  }
};

// 更新好友状态
exports.updateFriendState = async function (data, res) {
  let wherestr = {
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  };

  try {
    let result = await Friend.updateMany(wherestr, { state: 0 }).exec();
    res.send({ status: 200 });
  } catch (error) {
    res.send({ status: 500 });
  }
};

// 拒绝好友请求 / 删除好友
exports.deleteFriend = async function (data, res) {
  let wherestr = {
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  };

  try {
    let result = await Friend.deleteMany(wherestr).exec();
    res.send({ status: 200 });
  } catch (error) {
    res.send({ status: 500 });
  }
};

// 单独的一个接口，按要求获取好友列表

exports.getUsers88 = async function (data, res) {
  try {
    let query = Friend.find({});
    query.where({ userID: data.uid, state: data.state });
    query.populate("friendID");
    query.sort({ lastTime: -1 });

    const result = await query.exec();
    console.log(result);

    const userArray = result.map((ver) => ({
      id: ver.friendID._id,
      name: ver.friendID.name,
      markname: ver.markname,
      imgUrl: ver.friendID.imgUrl,
      lastTime: ver.lastTime,
      type: 0,
    }));

    res.send({ status: 200, result: userArray });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ status: 500 });
  }
};

//按要求获取用户列表
// 废弃
exports.getUsers1 = function (data, res) {
  let query = Friend.find({});
  //查询条件
  query.where({ userID: data.uid, state: data.state });
  //查找frindeID关联的user对象
  query.populate("friendID");
  //排序方式最有通讯时间倒序排列
  query.sort({ lastTime: -1 });
  //查询结果
  query
    .exec()
    .then(function (e) {
      let result = e.map(function (ver) {
        return {
          id: ver.friendID._id,
          name: ver.friendID.name,
          markname: ver.markname,
          imgUrl: ver.friendID.imgUrl,
          lastTime: ver.lastTime,
          type: 0,
        };
      });
      res.send({ status: 200, result });
    })
    .catch(function (err) {
      console.error("Error:", err);
      res.send({ status: 500 });
    });
};
function getUsers2(data, res) {
  return new Promise(function (resolve, reject) {
    let query = Friend.find({});
    //查询条件
    query.where({ userID: data.uid, state: data.state });
    //查找frindeID关联的user对象
    query.populate("friendID");
    //排序方式最有通讯时间倒序排列
    query.sort({ lastTime: -1 });
    //查询结果
    query
      .exec()
      .then(function (e) {
        let result = e.map(function (ver) {
          return {
            id: ver.friendID._id,
            name: ver.friendID.name,
            markname: ver.markname,
            imgUrl: ver.friendID.imgUrl,
            lastTime: ver.lastTime,
            type: 0,
          };
        });
        // resolve({ status: 200, result });
        resolve(result);
      })
      .catch(function (err) {
        console.error("Error:", err);
        reject({ status: 500 });
      });
  }).then(function onFulilled(value) {
    res.send(value);
  });
}
// 优化
async function getUsers(data) {
  try {
    const result = await Friend.find({ userID: data.uid, state: data.state })
      .populate("friendID")
      .sort({ lastTime: -1 })
      .exec();

    const userArray = result.map((ver) => ({
      id: ver.friendID._id,
      name: ver.friendID.name,
      markname: ver.markname,
      imgUrl: ver.friendID.imgUrl,
      lastTime: ver.lastTime,
      type: 0,
    }));

    return userArray;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// 按要求获取一条一对一消息
// 废弃
exports.getOneMsg1 = function (data, res) {
  let query = Message.findOne({});
  //查询条件
  query.where({
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  });
  //排序方式最有通讯时间倒序排列
  query.sort({ time: -1 });
  //查询结果
  query
    .exec()
    .then(function (ver) {
      let result = {
        message: ver.message,
        time: ver.time,
        types: ver.types,
      };
      res.send({ status: 200, result });
    })
    .catch(function (err) {
      console.error("Error:", err);
      res.send({ status: 500 });
    });
};
function getOneMsg2(data, res) {
  return new Promise(function (resolve, reject) {
    let query = Message.findOne({});
    //查询条件
    query.where({
      $or: [
        { userID: data.uid, friendID: data.fid },
        { userID: data.fid, friendID: data.uid },
      ],
    });
    //排序方式最有通讯时间倒序排列
    query.sort({ time: -1 });
    query
      .exec()
      .then(function (ver) {
        let result = {
          message: ver.message,
          time: ver.time,
          types: ver.types,
        };
        // resolve({ status: 200, result });
        resolve(result);
      })
      .catch(function (err) {
        console.error("Error:", err);
        reject({ status: 500 });
      })
      .then(function onFulilled(value) {
        res.send(value);
      });
  });

  //查询结果
}
// 优化
async function getOneMsg(uid, fid) {
  try {
    const result = await Message.findOne({
      $or: [
        { userID: uid, friendID: fid },
        { userID: fid, friendID: uid },
      ],
    })
      .sort({ time: -1 })
      .exec();
    // console.log("结果： " + result);
    return {
      message: result.message,
      time: result.time,
      types: result.types,
    };
  } catch (error) {
    console.error("Error:", error);
    return { status: 500 };
  }
}

//汇总一对一消息未读数
// 废弃
exports.unreadMsg1 = async function (data, res) {
  // 汇总条件
  let wherestr = { userID: data.fid, friendID: data.uid, state: 0 };
  try {
    let result = await Message.countDocuments(wherestr);
    res.send({ status: 200, result });
  } catch (error) {
    console.log(error);
    res.send({ status: 500 });
  }
};
function unreadMsg2(data, res) {
  return new Promise(function (resolve, reject) {
    // 汇总条件
    let wherestr = { userID: data.fid, friendID: data.uid, state: 0 };
    try {
      let result = Message.countDocuments(wherestr);
      // resolve({ status: 200, result });
      resolve(result);
    } catch (error) {
      console.log(error);
      reject({ status: 500 });
    }
  });
}
// 优化
async function unreadMsg(uid, fid) {
  try {
    const result = await Message.countDocuments({
      userID: fid,
      friendID: uid,
      state: 1,
    });
    return result;
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
}

// 联合查找好友及最后一条消息及未读信息数
async function doIt(data, res) {
  try {
    const result = await getUsers(data);
    // console.log(result);

    const messagesPromises = result.map(async (friend) => {
      try {
        const [messageData, cc] = await Promise.all([
          getOneMsg(data.uid, friend.id),
          unreadMsg(data.uid, friend.id),
        ]);
        // console.log(messageData.types);
        if (messageData.types == 0) {
          // 文字
        } else if (messageData.types == 1) {
          // 图片
          messageData.message = "[图片]";
        } else if (messageData.types == 2) {
          // 音频
          messageData.message = "[音频]";
        } else if (messageData.types == 3) {
          // 定位
          messageData.message = "[定位]";
        }

        return {
          ...friend,
          message: messageData.message,
          tip: cc,
        };
      } catch (error) {
        console.error(error);
        return { status: 500 };
      }
    });

    const friendData = await Promise.all(messagesPromises);

    res.send({ status: 200, result: friendData });
  } catch (error) {
    console.error(error);
    res.send({ status: 500 });
  }
}

// async function doIt(data, res) {
//   let friend, bb, cc, err;
//   [err, friend] = await getUsers(data)
//     .then((data) => [null, data])
//     .catch((err) => [err, null]);
//   for (let i = 0; i < friend.length; i++) {
//     [err, bb] = await getOneMsg(data.uid, friend[i].id)
//       .then((data) => [null, data])
//       .catch((err) => [err, null]);
//     if (bb.types == 0) {
//       // 文字
//     } else if (bb.types == 1) {
//       // 图片
//       bb.message = "[图片]";
//     } else if (bb.types == 2) {
//       // 音频
//       bb.message = "[音频]";
//     } else if (bb.types == 3) {
//       // 定位
//       bb.message = "[定位]";
//     }
//     friend[i].message = bb.message;
//     [err, cc] = await unreadMsg(data.uid, friend[i].id)
//       .then((data) => [null, data])
//       .catch((err) => [err, null]);
//     friend[i].tip = cc;
//   }
//   if (err) {
//     res.send(err);
//   } else {
//     res.send({ status: 200, friend });
//   }
// }

// 导出getUsers函数
exports.getUsers = function (data, res) {
  doIt(data, res);
};

// 设置好友消息已读
exports.readUnreadMsg = async function (uid, fid, res) {
  // 修改条件
  let wherestr = { userID: uid, friendID: fid, state: 1 };
  let updateste = { state: 0 };
  try {
    let result = await Message.updateMany(wherestr, updateste);
    // res.send({ status: 200 });
  } catch (error) {
    console.log(error);
    res.send({ status: 500 });
  }
};

// 建群
exports.createGroup = async function (data, res) {
  // console.log(data);
  try {
    let groupData = {
      userID: data.uid,
      groupName: data.groupName,
      imgUrl: data.imgUrl,
      time: new Date(),
    };

    let group = new Group(groupData);
    let result = await group.save();
    // console.log(result);

    // 群主入群
    let udata = {
      groupID: result._id,
      userID: data.uid,
      time: new Date(),
      lastTime: new Date(),
    };
    this.insertGroupUser(udata);

    // 添加好友入群
    await Promise.all(
      data.user.map(async (userId) => {
        let fdata = {
          groupID: result._id,
          userID: userId,
          time: new Date(),
          lastTime: new Date(),
        };
        await this.insertGroupUser(fdata);
      })
    );
    // 创建群成功
    res.send({ status: 200, result });
  } catch (error) {
    console.error("Error:", error);
    res.send({ status: 500 });
  }
};

// 添加群成员方法
exports.insertGroupUser = async function (data) {
  try {
    let groupuser = new GroupUser(data);
    await groupuser.save();
    // console.log("添加群成员成功");
  } catch (error) {
    console.error("Error:", error);
    // 可以抛出错误或其他处理
  }
};

// 邀请好友入群
exports.inviteFriend = async function (data, res) {
  // console.log(data);
  try {
    // 添加好友入群
    await Promise.all(
      data.user.map(async (userId) => {
        let fdata = {
          groupID: data.gid,
          userID: userId,
          time: new Date(),
          lastTime: new Date(),
        };
        // console.log(fdata);

        await this.insertGroupUser(fdata);
      })
    );
    // 创建群成功
    res.send({ status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.send({ status: 500 });
  }
};

// 建群   旧版
exports.createGroup1 = function (data, res) {
  return new Promise(function (resolve, reject) {
    let groupData = {
      userID: data.uid, // 用户id
      name: data.name, // 群名称
      imgUrl: data.imgUrl, // 群头像
      time: new Date(), // 创建时间
    };
    let group = new Group(groupData);

    group.save(function (err, result) {
      if (err) {
        reject({ status: 500 });
      } else {
        resolve(result);
      }
    });
  })
    .then(function onFulilled(value) {
      // 添加好友入群
      for (let i = 0; i < data.user.length; i++) {
        let fdata = {
          groupID: value._id, //群id
          userID: data.uid, //用户id
          time: new Date(), // 加入群时间
          lastTime: new Date(), // // 最后通讯时间（后加入群）
        };
        // 加入群
        this.insertGroupUser(fdata);
      }
      // 创建群成功
      res.send({ status: 200 });
    })
    .catch(function onRejected(error) {
      res.send(error);
    });
};
//添加群成员方法
exports.insertGroupUser1 = function (data) {
  let groupuser = new GroupUser(data);
  groupuser.save(function (err, res) {
    if (err) {
      res.send({ status: 500 });
    } else {
      console.log("添加群成员成功");
    }
  });
};

// 添加群消息
exports.insertGroupMsg = async function (gid, uid, msg, type, res) {
  let data = {
    groupID: gid,
    userID: uid, //用户id
    message: msg, //内容
    types: type, //内容类型(0文字，1图片链接，2音频链接。..)
    time: new Date(), //发送时间
  };
  let groupmsg = new GroupMsg(data);
  try {
    let result = await groupmsg.save();
    if (res) {
      res.send({ status: 200 });
    }
  } catch (err) {
    if (res) {
      res.send({ status: 500 });
    }
  }
};

// 删除群成员
exports.deleteGroupMember = async function (data, res) {
  let wherestr = {
    $and: [
      { groupID: data.gid }, // 指定要删除群成员的群组ID
      { userID: data.uid }, // 指定要删除的成员的用户ID
    ],
  };

  try {
    let result = await GroupUser.deleteMany(wherestr).exec();

    if (result.deletedCount > 0) {
      // 文档删除成功
      res.send({
        status: 200,
        message: `${result.deletedCount} 个群成员已删除`,
      });
    } else {
      // 没有找到匹配的文档
      res.send({ status: 404, message: "没有找到匹配的群成员需要删除" });
    }
  } catch (error) {
    // 处理错误
    console.error("删除群成员时发生错误：", error);
    res.send({ status: 500, message: "内部服务器错误" });
  }
};

// 解散群聊
exports.deleteGroup = async function (data, res) {
  try {
    console.log(data);
    // 删除群聊
    let groupResult = await Group.deleteOne({ _id: data.gid }).exec();

    if (groupResult.deletedCount > 0) {
      // 群聊删除成功，接着删除群成员
      let groupUserResult = await GroupUser.deleteMany({
        groupID: data.gid,
      }).exec();

      let groupUserResultMsg = await GroupMsg.deleteMany({
        groupID: data.gid,
      }).exec();

      res.send({
        status: 200,
        message: `群聊删除成功，${groupUserResult.deletedCount} 个群成员已删除`,
      });
    } else {
      // 没有找到匹配的群聊
      res.send({ status: 404, message: "没有找到匹配的群聊需要删除" });
    }
  } catch (error) {
    // 处理错误
    console.error("删除群聊时发生错误：", error);
    res.send({ status: 500, message: "内部服务器错误" });
  }
};

//按要求获取群列表
exports.getGroups1 = function (uid, res) {
  // id 为用户所在的群
  let query = GroupUser.find({});
  //查询条件
  query.where({ userID: uid });
  //查找frindeID关联的user对象王
  query.populate("groupID");
  //排序方式最有通讯时间倒序排列
  query.sort({ lastTime: -1 });
  //查询结果
  query
    .exec()
    .then(function (e) {
      let result = e.map(function (ver) {
        return {
          id: ver.groupID._id,
          name: ver.groupID.groupName,
          markname: ver.name,
          imgUrl: ver.groupID.imgUrl,
          lastTime: ver.lastTime,
          tip: ver.tip,
          type: 1,
        };
      });
      res.send({ status: 200, result });
    })
    .catch(function (err) {
      console.error("Error:", err);
      res.send({ status: 500 });
    });
};

// 按要求获取最后一条群消息
exports.getOneGroupMsg1 = function (gid, res) {
  let query = GroupMsg.findOne({});
  //查询条件
  query.where({ groupID: gid });
  //查找关联的user对象王
  query.populate("userID");
  //排序方式最后通讯时间倒序排列
  query.sort({ time: -1 });
  //查询结果
  query
    .exec()
    .then(function (ver) {
      let result = {
        message: ver.message,
        time: ver.time,
        types: ver.types,
        name: ver.userId.name,
      };
      res.send({ status: 200, result });
    })
    .catch(function (err) {
      console.error("Error:", err);
      res.send({ status: 500 });
    });
};

// 新版，获取群列表
async function getGroupsAndLastMsg(uid) {
  try {
    // 查询用户所在的群
    const groupUsers = await GroupUser.find({ userID: uid })
      .populate("groupID")
      .sort({ lastTime: -1 })
      .exec();

    // 格式化结果
    const resultPromises = groupUsers.map(async function (ver) {
      // 获取每个群的最后一条消息信息
      const lastMsgInfo = await getOneGroupMsg(ver.groupID._id);
      // console.log(lastMsgInfo.result.time);
      return {
        id: ver.groupID._id,
        name: ver.groupID.groupName,
        imgUrl: ver.groupID.imgUrl,
        lastTime: lastMsgInfo ? lastMsgInfo.result.time : null,
        time: ver.lastTime,
        tip: ver.tip,
        type: 1,
        message: lastMsgInfo ? lastMsgInfo.result.message : null,
      };
    });

    // 等待所有结果完成
    const result = await Promise.all(resultPromises);

    return { status: 200, result };
  } catch (err) {
    console.error("Error in getGroupsAndLastMsg:", err);
    return { status: 500 };
  }
}

exports.getGroups = function (uid, res) {
  getGroupsAndLastMsg(uid)
    .then((response) => res.send(response))
    .catch(() => res.send({ status: 500 }));
};

async function getOneGroupMsg(gid) {
  try {
    // 查询群消息
    const groupMsg = await GroupMsg.findOne({ groupID: gid })
      .populate("userID")
      .sort({ time: -1 })
      .exec();

    // console.log(groupMsg);
    // 格式化结果
    if (groupMsg) {
      const result = {
        message: groupMsg.message,
        time: groupMsg.time,
        types: groupMsg.types,
      };
      // console.log(result);
      return { status: 200, result };
    }
  } catch (err) {
    console.error("Error in getOneGroupMsg:", err);
    return { status: 500 };
  }
}

// 获取群成员
exports.getGroupUserLst = function (gid, res) {
  let query = GroupUser.find({});
  query.where({ groupID: gid });

  query
    .exec()
    .then(async function (groupUsers) {
      // 获取群用户列表及详细信息
      let userList = await Promise.all(
        groupUsers.map(async function (groupUser) {
          // 获取用户详细信息
          let userInfo = await getUserInfo(groupUser.userID);
          return {
            uid: groupUser.userID,
            time: groupUser.time,
            userDetail: userInfo,
          };
        })
      );
      // console.log(userList);

      res.send({ status: 200, userList });
    })
    .catch(function (err) {
      console.error("Error:", err);
      res.send({ status: 500 });
    });
};
// 辅助函数：从User表中获取用户详细信息
async function getUserInfo(uid) {
  try {
    let user = await User.findOne({ _id: uid });
    return {
      uid: user._id,
      name: user.name,
      imgUrl: user.imgUrl,
    };
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

// 获取群详细信息
async function getGroupInfo(gid) {
  try {
    // 查询群信息
    const groupInfo = await Group.findOne({ _id: gid }).exec();

    // 格式化结果
    const result = {
      gid: groupInfo._id,
      userID: groupInfo.userID,
      groupName: groupInfo.groupName,
      imgUrl: groupInfo.imgUrl,
      time: groupInfo.time,
      notice: groupInfo.notice ? groupInfo.notice : "没有群公告",
    };

    return { status: 200, result };
  } catch (err) {
    console.error("Error in getGroupInfo:", err);
    return { status: 500 };
  }
}

exports.getGroupInfo = async function (gid, res) {
  const response = await getGroupInfo(gid);
  res.send(response);
};

// 设置群消息已读
exports.readUnreadGroupMsg = async function (data, res) {
  // 修改条件
  let wherestr = { userID: data.uid, friendID: data.fid };
  let updateste = { tip: 0 };
  try {
    let result = await Message.updateOne(wherestr, updateste);
    res.send({ status: 200 });
  } catch (error) {
    console.log(error);
    res.send({ status: 500 });
  }
};

// 修改群消息数据库通用方法
async function updateG(gid, update, res) {
  const updatedGroup = await Group.findByIdAndUpdate(gid, update, {
    new: true,
  });

  try {
    // console.log(updatedGroup);

    if (updatedGroup) {
      // 修改成功
      return res.send({ status: 200, updatedGroup });
    }
  } catch (error) {
    // console.log(error);
    return res.send({ status: 500 });
  }
}

// 群信息修改
exports.GroupUpdate = async function (data, res) {
  console.log(data);
  try {
    let updatestr = {};
    updatestr[data.type] = data.data;
    // console.log(updatestr);

    // 修改数据库
    updateG(data.gid, updatestr, res);

    // updatestr[data.type] = data.data;
    // // 修改数据库
    // update(data.id, updatestr, res);
  } catch (error) {
    console.error(error);
    res.send({ status: 500 });
  }
};

// 分页
// 分页获取私聊数据
exports.message = function (data, res) {
  if (data.pageNumber < 0 || data.msgQuantity <= 0) {
    return res.send({ status: 800, message: "无效的分页参数" });
  }
  // pageNumber：当前页码，msgQuantity：每页最大信息条数
  let skipNum = data.pageNumber * data.msgQuantity;

  let query = Message.find({});

  //查询条件
  query.where({
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  });
  //排序方式最有通讯时间倒序排列
  query.sort({ time: -1 });

  //查找frindeID关联的user对象
  query.populate("userID");

  // 跳过条数
  query.skip(skipNum);
  // 每页的数据条数
  query.limit(data.msgQuantity);

  //查询结果
  query
    .exec()
    .then(function (e) {
      let result = e.map(function (ver) {
        return {
          id: ver._id,
          message: ver.message,
          types: ver.types,
          time: ver.time,
          fromId: ver.userID._id,
          imgUrl: ver.userID.imgUrl,
        };
      });
      // console.log(result);
      res.send({ status: 200, result });
    })
    .catch(function (err) {
      console.error("Error:", err);
      res.send({ status: 500 });
    });
};

// 分页获取群聊信息
exports.getGroupMessages = function (data, res) {
  if (data.pageNumber < 0 || data.msgQuantity <= 0) {
    return res.send({ status: 800, message: "无效的分页参数" });
  }
  let query = GroupMsg.find({});

  // 查询条件
  query.where({ groupID: data.gid });

  // 排序方式按通讯时间倒序排列
  query.sort({ time: -1 });

  // 查找 userID 关联的 user 对象
  query.populate("userID");

  // 查询结果
  query
    .exec()
    .then(function (messages) {
      let result = messages.map(function (message) {
        // console.log(message);
        return {
          id: message._id,
          groupID: message.groupID,
          fromId: message.userID._id,
          name: message.userID.name,
          imgUrl: message.userID.imgUrl,
          message: message.message,
          types: message.types,
          time: message.time,
        };
      });
      // console.log(result);
      res.send({ status: 200, result });
    })
    .catch(function (err) {
      console.error("Error:", err);
      res.status(500).send({ status: 500, message: "Internal Server Error" });
    });
};

// exports.findUser = async function (res) {
//   try {
//     const users = await User.find().exec();

//     res.send(users);
//   } catch (err) {
//     console.log("查询用户数据失败:" + err);
//   }
// };

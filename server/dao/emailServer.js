// 引用发送邮件插件
let nodemailer = require("nodemailer");
// 引入证书文件
let credentials = require("../config/credentials");

// 创建传输方式
let transporter = nodemailer.createTransport({
  service: "qq",
  auth: {
    user: credentials.qq.user,
    pass: credentials.qq.pass,
  },
});

//注册发送邮件给用户
exports.emailSignUp = function (email, res) {
  //发送信息内容
  let options = {
    from: "2549539125@qq.com",
    to: email,
    subject: "感谢您在AN注册",
    html: '<span>欢迎你的加入!</span><a href="http://localhost:8080/">点击</a>',
  };

  //发送邮件
  transporter.sendMail(options, function (err, msg) {
    if (err) {
      res.send(err);
      //   res.send("邮箱发送失败");
      console.log(err);
    } else {
      res.send("邮箱发送成功");
      console.log("邮箱发送成功!");
    }
  });
};

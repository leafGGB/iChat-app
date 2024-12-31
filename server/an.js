// 引入解析插件
const bodyParser = require("body-parser");
// 引入token
let jwt = require("./utils/jwt");

const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

// 引入live.js
require("./dao/live")(app);

// socket.io
// let server = app.listen(8080);
// let io = require("socket.io").listen(server);
io.on("connection", (socket) => {
  console.log("8080端口连接成功");
});
server.listen(8010, () => {
  console.log("Server is running on port 8020");
});
require("./dao/socket")(io);

// 使用cors中间件跨域
app.use(cors());

// 解析前端数据
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// 获取静态路径
app.use(express.static(__dirname + "/filesData"));

// token判断
app.use(function (req, res, next) {
  if (typeof req.body.token != "undefined") {
    // 处理token匹配
    let token = req.body.token;
    // console.log(req.body);
    let tokenMatch = jwt.verifyToken(token);
    // console.log("正确token: " + req.body);

    if (tokenMatch == 1) {
      // 验证通过
      next();
    } else {
      // 不验证通过
      // console.log("错误token: " + req.body);

      res.send({ status: 300 });
    }
  } else {
    next();
  }
});

// 路由
require("./router/index")(app);
require("./router/filesRouter")(app);

// 404页面
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// 出现错误处理
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port, () => {
  console.log(`端口启动成功 ${port}`);
});

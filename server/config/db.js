let mongoose = require("mongoose");

let db = mongoose.createConnection("mongodb://127.0.0.1:27017/AN", {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});
// 将连接与错误事件绑定（以获得连接错误的提示）
db.on("error", console.error.bind(console, "MongoDB 连接错误："));
db.once("open", function () {
  console.log("MongoDB 连接成功");
});

module.exports = db;

// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('');

// }

// 引入附件上传插件
let multer = require("multer");
const path = require("path");
let mkdir = require("../utils/mkdir");

// DiskStorage 磁盘存储引擎
// 磁盘存储引擎可以让你控制文件的存储。有两个属性，属性值都是函数。destination，指定文件存储的路径；filename，指定文件的存储名称。
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 路径
    let url = req.body.url;
    mkdir.mkdirs("../filesData/" + url, (err) => {
      console.log(err);
    });
    cb(null, "./filesData/" + url);
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    // console.log(originalname);
    const extname = path.extname(originalname);
    let name = file.originalname.replace(/^(.*?)\..*$/, "$1");
    // console.log("2" + name);

    filename = `${Date.now()}-${name}${extname}`;
    cb(null, filename);
  },
});

let upload = multer({ storage });

module.exports = upload;

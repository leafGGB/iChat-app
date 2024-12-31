// 引入附件上传插件
let multer = require("multer");
// const path = require("path");
let upload = require("../middleware/file.middleware");
let mkdir = require("../utils/mkdir");

// DiskStorage 磁盘存储引擎
// 磁盘存储引擎可以让你控制文件的存储。有两个属性，属性值都是函数。destination，指定文件存储的路径；filename，指定文件的存储名称。
// let storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../filesData/test"));
//   },
//   filename: (req, file, cb) => {
//     const originalname = file.originalname;
//     const extname = path.extname(originalname);
//     filename = `${file.fieldname}-${Date.now()}${extname}`;
//     cb(null, filename);
//   },
// });

// let upload = multer({ storage });

module.exports = function (app) {
  // 前端文件上传
  app.post(
    "/files/upload",
    upload.array("file", 10),
    function (req, res, next) {
      try {
        // 获取文件信息
        let data = req.files;
        // 返回给前端
        // console.log(data[0].filename);
        let url = req.body.url;
        let imgUrl = "/" + url + "/" + data[0].filename;
        // res.send(data);
        res.send(imgUrl);
      } catch (error) {
        console.error("File upload error:", error);
        res.status(500).send("Internal Server Error");
      }
    }
  );
};

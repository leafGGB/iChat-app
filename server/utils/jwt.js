// token
// 引入token
let jwt = require("jsonwebtoken");
let secret = "anwcyouwenzi";

//生成token
exports.generateToken = function (e) {
  let payload = { id: e, time: new Date() };
  let token = jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 * 120 });
  return token;
};
//解码token
exports.verifyToken = function (e) {
  let payload;
  jwt.verify(e, secret, function (err, result) {
    if (err) {
      payload = 0;
    } else {
      payload = 1;
    }
  });
  return payload;
};

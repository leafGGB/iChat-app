var bcrypt = require("bcryptjs");

// 生成hash密码
exports.encryption = function (e) {
  // salt是一个随机字符串
  // 生成随机的salt
  let salt = bcrypt.genSaltSync(10);

  // 生成hash密码
  let hash = bcrypt.hashSync(e, salt);

  return hash;
};

// 解密
exports.verification = function (e, hash) {
  let verif = bcrypt.compareSync(e, hash);

  return verif;
};

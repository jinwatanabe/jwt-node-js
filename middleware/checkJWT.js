const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  //JWTを持っている確認->リクエストヘッダのx-auth-tokenを確認
  const token = req.header("x-auth-token");

  if (!token) {
    res.status(400).json([
      {
        message: "JWTを持っていません",
      },
    ]);
  } else {
    try {
      let user = await JWT.verify(token, "SECRET_KEY");
      console.log(user);
      req.user = user.email;
      next();
    } catch {
      res.status(400).json([
        {
          message: "JWTが無効です",
        },
      ]);
    }
  }
};

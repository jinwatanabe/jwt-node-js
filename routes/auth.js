const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const User = require("../db/User");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.send("Hello Authjs");
});

//ユーザー新規登録用のAPI
router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //3:DBにユーザーが存在しているか確認
    const user = User.find((user) => user.email === email);
    if (user) {
      return res.status(400).json({
        message: "すでにそのユーザーは存在しています",
      });
    }

    //4:パスワードの暗号化
    let hashedPassword = await bcrypt.hashSync(password, 10);
    console.log(hashedPassword);

    //5:DBにユーザーを登録
    User.push({
      email: email,
      password: hashedPassword,
    });

    //6:クライアントへJWTの発行
    const token = await JWT.sign(
      {
        email,
      },
      "SECRET_KEY",
      {
        expiresIn: "24h",
      }
    );

    return res.json({
      token: token,
    });
  }
);

//ログイン用のAPI
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = User.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json({
      message: "ユーザーが存在しません",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "パスワードが一致しません",
    });
  }

  const token = await JWT.sign(
    {
      email,
    },
    "SECRET_KEY",
    {
      expiresIn: "24h",
    }
  );

  return res.json({
    token: token,
  });
});

//DBのユーザーを確認するAPI
router.get("/allUsers", (req, res) => {
  res.json(User);
});

module.exports = router;

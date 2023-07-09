const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { Users } = require("../models");

// 회원가입 API
router.post("/signup", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;
  const isExistUser = await Users.findOne({ where: { nickname: nickname } });

  try {
    if (!/^[a-z]+[a-z0-9]{3,16}$/g.test(nickname)) return res.status(412).json({ errorMessage: 'nickname값은 영문으로 시작하는 영문, 숫자 3~16자를 입력해 주세요.' });
    if (!/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\-_=+]).{4,16}$/.test(password)) return res.status(412).json({ errorMessage: 'password값은 4~16자 영문, 숫자, 특수문자를 최소 한가지씩 조합해서 입력해 주세요.' });

    console.log(isExistUser)
    if(isExistUser) return res.status(412).json({ errorMessage: "닉네임이 이미 사용중입니다." });
    if(password !== confirmPassword) return res.status(412).json({ errorMessage: "패스워드가 일치하지 않습니다." });

    await Users.create({ nickname, password });

    res.status(201).json({ message: "회원 가입에 성공하였습니다." });
  }catch (error) {
    return res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
})

// 로그인 API
router.post("/login", async (req,res) => {
  const { nickname, password } = req.body;

  const user = await Users.findOne({ where: { nickname : nickname } });

  if (!user || user.password !== password) return res.status(412).json({errorMessage: "닉네임 또는 패스워드가 틀렸습니다."});

  const token = jwt.sign({ userId: user.userId },"nodejs-LV4-key");

	res.cookie("authorization", `Bearer ${token}`); 
  res.status(200).json({ token: token }); 
})

module.exports = router;
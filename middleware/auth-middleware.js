const jwt = require("jsonwebtoken");
const { Users } = require("../models");

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  const { authorization  } = req.cookies;
  const [tokenType, token] = (authorization ?? "").split(" ");

  if (tokenType !== "Bearer" || !token ) return res.status(401).json({errorMessage: "로그인 후 이용 가능한 기능입니다."});

  try {
    const decodedToken = jwt.verify(token, "nodejs-LV3-key");
    const userId = decodedToken.userId;

    const user = await Users.findOne({ where: { userId }});
    if (!user) {
      return res.status(401).json({ message: "토큰 사용자가 존재하지 않습니다." });
    }
    res.locals.user = user;

    next();
  } catch (error) {
    return res.status(401).json({message: "비정상적인 요청입니다."});
  }
}

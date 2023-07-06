const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const commentRouter = require("./routes/comments");

app.use(express.json());
app.use(cookieParser());
app.use("/", [userRouter, postRouter, commentRouter]);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸습니다.");
});
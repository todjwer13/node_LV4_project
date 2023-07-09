const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Posts, Users, Likes } = require("../models");
const authMiddleware = require("../middleware/auth-middleware");

// 게시글 작성
router.post("/posts", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { userId } = res.locals.user;

  const user = await Users.findOne({ where: { userId } });
  if (!title) return res.status(412).json({ Message: "게시글 제목을 입력해 주세요" });
  if (!content) return res.status(412).json({ Message: "게시글 내용을 입력해 주세요" });
  if (typeof title !== "string") return res.status(412).json({ Message: "게시글 제목의 형식이 일치하지 않습니다" });
  if (typeof content !== "string") return res.status(412).json({ Message: "게시글 내용의 형식이 일치하지 않습니다" });
  try {
    await Posts.create({UserId: userId, nickname: user.nickname, title, content});
    res.status(201).json({ Message: "게시글을 생성하였습니다." });
  } catch (error) {
    return res.status(400).json({ errorMessage: "게시글 작성 실패하였습니다." });
  }
});

// 전체 게시글 조회
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: [
        "postId",
        "UserId",
        "nickname",
        "title",
        "createdAt",
        "updatedAt",
      ],
      oreder: [["createdAt", "DESC"]],
    });

    res.status(200).json({ posts });
  } catch (error) {
    return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const posts = await Posts.findOne({
      attributes: [
        "postId",
        "UserId",
        "nickname",
        "title",
        "content",
        "createdAt",
        "updatedAt",
      ],
      where: { postId },
    });
    res.status(200).json({ posts });
  } catch (error) {
    return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const { userId } = res.locals.user;
  const post = await Posts.findOne({ where: { postId } });

  if (!post) {return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
  } else if (!title) {return res.status(412).json({ errorMessage: "게시글 제목을 입력해 주세요" });
  } else if (!content) {return res.status(412).json({ errorMessage: "게시글 내용을 입력해 주세요" });
  } else if (typeof title !== "string") {return res.status(412) .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
  } else if (typeof content !== "string") {return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
  } else if (userId !== post.UserId) {return res.status(412).json({ errorMessage: "게시글 수정권한이 없습니다." });
  }
  try {
    await Posts.updateOne(
      { title, content },
      { where: { [Op.and]: [{ postId }, {UserId: userId}]}, },
    );
    res.json({ message: "게시글을 수정하였습니다." });
  } catch (error) {
    return res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const post = await Posts.findOne({ where: { postId } });
  if (post) {
    if (userId === post.UserId) {
      await post.destroy({ where: {postId: postId} });
      res.status(200).json({ success: true, message: "게시글을 삭제하였습니" });
    } else {
      res.status(400).json({ Message: "게시글 삭제 권한이 없습니다." });
    }
  } else {
    res
      .status(404)
      .json({ errorMessage: "이미 삭제되었거나 게시글이 존재하지 않습니다." });
  }
});

module.exports = router;

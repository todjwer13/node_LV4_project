const express = require('express');
const router = express.Router();
const { Posts ,Likes } = require('../models');
const authMiddleware = require("../middleware/auth-middleware");

router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  
  const like = await Likes.findOne({
    where: {  PostId: postId , UserId: userId  },
  })

  if(like) {
    Likes.destroy({where: { PostId: postId, UserId: userId }});
    res.status(200).json({ message: "해당 게시글의 좋아요를 취소하셨습니다." });
  } else {
    Likes.create({ UserId: userId, PostId: postId });
    res.status(200).json({ message: "해당 게시글을 좋아요 하셨습니다."});
  }
})

router.get("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const likes = await Likes.findAll({ where: { PostId: postId}});
  console.log(likes.length);
  return res.status(200).json({ message: `좋아요 ${likes.length}`})
})

router.get("/like/posts", authMiddleware, async (req,res) => {
  const { userId } = res.locals.user;
  console.log( userId )
  const likeposts = await Likes.findAll({
    where: {UserId: userId},
    attributes: [],
    include: [
      {
      model: Posts,
      attributes: [ "title", "content", "nickname", "createdAt", "updatedAt"],
    },
  ],
  });
  console.log(likeposts)
  return res.status(200).json({ likeposts })
})


module.exports = router;
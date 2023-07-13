const express = require('express');
const router = express.Router();
const { Posts, Likes } = require('../models');
const authMiddleware = require('../middleware/auth-middleware');

// 게시글 좋아요 생성, 삭제
router.put('/posts/:postId/like', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const like = await Likes.findOne({
    where: { postId, userId },
  });
  const post = await Posts.findOne({ where: { postId, userId } });
  console.log(post);

  if (like) {
    await Likes.destroy({ where: { postId, userId } });
    await Posts.update({ likes: post.likes - 1 }, { where: { postId } });
    res.status(200).json({ message: '해당 게시글의 좋아요를 취소하셨습니다.' });
  } else {
    await Likes.create({ userId, postId });
    await Posts.update({ likes: post.likes + 1 }, { where: { postId } });
    res.status(200).json({ message: '해당 게시글을 좋아요 하셨습니다.' });
  }
});

// 게시글 좋아요 확인
router.get('/posts/:postId/like', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const likes = await Posts.findAll({ where: { postId } });
  console.log(likes.length);
  return res.status(200).json({ message: `좋아요 ${likes.length}` });
});

// 좋아요 게시글 조회
router.get('/like/posts', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const likeposts = await Likes.findAll({
    where: { userId },
    attributes: [],
    include: [
      {
        model: Posts,
        order: [['likes', 'DESC']],
        attributes: [
          'title',
          'nickname',
          'content',
          'likes',
          'createdAt',
          'updatedAt',
        ],
      },
    ],
  });
  return res.status(200).json({ likeposts });
});

module.exports = router;

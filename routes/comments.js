const express = require('express');
const router = express.Router();
const { Comments } = require('../models');
const authMiddleware = require('../middleware/auth-middleware.js');

// 댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId, nickname } = res.locals.user;
  const { comment } = req.body;

  if (!comment) {
    res.status(412).json({ errorMessage: '댓글을 입력해주세요' });
  } else {
    Comments.create({ postId, userId, nickname, comment });
    res.status(201).json({ message: '댓글이 작성되었습니다' });
  }
});

// 댓글 조회
router.get('/posts/:postId/comments', async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comments.findAll({
    where: { postId },
    oreder: [['createdAt', 'DESC']],
  });
  console.log(comments);
  const data = comments.map((comments) => {
    return {
      postId: comments.postId,
      userId: comments.userId,
      commentId: comments.commentId,
      nickname: comments.nickname,
      comment: comments.comment,
      createdAt: comments.createdAt,
    };
  });
  console.log(data);
  res.status(200).json({ data });
});

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;
  const { userId } = res.locals.user;
  const comments = await Comments.findOne({ where: { commentId } });

  if (!comments) {
    return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
  } else if (!comment) {
    return res.status(412).json({ errorMessage: '댓글의 내용을 입력해 주세요' });
  } else if (userId !== comments.userId) {
    return res.status(412).json({ errorMessage: '댓글 수정권한이 없습니다.' });
  }
  try {
    await Comments.update({ comment }, { where: { commentId: commentId } });
    res.json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    return res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
  }
});

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { userId } = res.locals.user;
  const comment = await Comments.findOne({ where: { commentId } });
  if (comment) {
    if (userId === comment.userId) {
      await Comments.destroy({ where: { commentId: commentId } });
      res.status(200).json({ success: true, message: '댓글을 삭제하였습니다' });
    } else {
      res.status(400).json({ Message: '댓글 삭제 권한이 없습니다.' });
    }
  } else {
    res.status(404).json({ errorMessage: '이미 삭제되었거나 댓글이 존재하지 않습니다.' });
  }
});

module.exports = router;

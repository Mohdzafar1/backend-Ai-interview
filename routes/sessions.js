const express = require('express');
const router = express.Router();
const authMiddleware=require("../middleware/authMiddleware")

const {
  startSession,
  submitAnswer,
  completeSession,
  getSessionHistory,
  getSessionById
} = require('../controller/sessionController');



router.post('/start', authMiddleware(), startSession);
router.post('/:sessionId/answer', authMiddleware(), submitAnswer);
router.post('/:sessionId/complete', authMiddleware(), completeSession);
router.get('/history', authMiddleware(), getSessionHistory);
router.get('/:sessionId', authMiddleware(), getSessionById);

module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware=require("../middleware/authMiddleware")

const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controller/questionController');



router.get('/', authMiddleware(), getQuestions);
router.post('/create', authMiddleware(), createQuestion);
router.put('/:id', authMiddleware(), updateQuestion);
router.delete('/:id', authMiddleware(), deleteQuestion);



module.exports = router;
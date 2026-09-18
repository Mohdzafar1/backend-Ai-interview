const express = require('express');
const router = express.Router();
const authMiddleware=require("../middleware/authMiddleware")

const {
  getAllInterviews,
  getInterviewById,
  seedInterviews,
  createInterview,
  updateInterview,
  addBuildQuestionIn,
  getEnroleInterview
} = require('../controller/interviewController');



router.get('/', getAllInterviews);
router.get('/:id', authMiddleware(), getInterviewById);
router.put('/:id', authMiddleware(), updateInterview);
router.post('/seed', authMiddleware(), seedInterviews);
router.post('/create', authMiddleware(), createInterview);
router.post('/addQuestionInInterview/:id', authMiddleware(), addBuildQuestionIn);
router.get('/getEnrolle/:id', authMiddleware(), getEnroleInterview);




module.exports = router;
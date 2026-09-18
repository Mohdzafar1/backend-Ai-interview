const express = require('express');
const router = express.Router();
const authMiddleware=require("../middleware/authMiddleware")

const { register, login, getMe, getAllCandidate, assignInterviewToCandidate } = require('../controller/authController');

router.get('/candidateList/:id', authMiddleware(), getAllCandidate);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware(), getMe);
// router.post('/conductInterview/:id', authMiddleware(), assignInterviewToCandidate);


// access by admin


module.exports = router;
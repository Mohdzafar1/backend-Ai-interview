const mongoose = require('mongoose');


const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionText: String,
  answerText: String,
  score: { type: Number, min: 0, max: 10 },
  feedback: String,
  timeTaken: Number, // seconds
  answeredAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  answers: [answerSchema],
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  overallFeedback: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  currentQuestionIndex: { type: Number, default: 0 }
});

module.exports = mongoose.model('Session', sessionSchema);
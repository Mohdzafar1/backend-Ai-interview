const Session = require('../model/Session');
const Interview = require('../model/Interview');
const OpenAI = require('openai/index.js');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// START SESSION
exports.startSession = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId).populate('questions');
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Mark old in-progress sessions as abandoned
    await Session.updateMany(
      { userId: req.user._id, interviewId, status: 'in-progress' },
      { status: 'abandoned' }
    );

    const session = await Session.create({
      userId: req.user._id,
      interviewId,
      status: 'in-progress',
      currentQuestionIndex: 0
    });

    res.status(201).json({ session, interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SUBMIT ANSWER
exports.submitAnswer = async (req, res) => {
  try {
    const { questionText, answerText, questionId, timeTaken } = req.body;

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Default scoring
    let score = 5;
    let feedback = 'Answer recorded.';

    // AI evaluation (optional)
    if (process.env.OPENAI_API_KEY && answerText?.trim().length > 10) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert technical interviewer. Evaluate the answer on a scale of 0-10 and provide brief feedback. Respond ONLY as JSON: {"score":number,"feedback":"string"}'
            },
            {
              role: 'user',
              content: `Question: ${questionText}\n\nAnswer: ${answerText}`
            }
          ],
          max_tokens: 200
        });

        const result = JSON.parse(completion.choices[0].message.content);
        score = result.score;
        feedback = result.feedback;
      } catch (aiErr) {
        // fallback scoring
        score = Math.min(10, Math.max(1, Math.floor(answerText.split(' ').length / 10)));
        feedback = 'Answer recorded. AI evaluation unavailable.';
      }
    }

    session.answers.push({
      questionId,
      questionText,
      answerText,
      score,
      feedback,
      timeTaken
    });

    session.currentQuestionIndex += 1;
    await session.save();

    res.json({
      score,
      feedback,
      currentQuestionIndex: session.currentQuestionIndex
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// COMPLETE SESSION
exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const totalScore = session.answers.reduce((sum, a) => sum + (a.score || 0), 0);
    const avgScore = session.answers.length
      ? totalScore / session.answers.length
      : 0;

    let overallFeedback = '';
    if (avgScore >= 8) overallFeedback = 'Excellent performance!';
    else if (avgScore >= 6) overallFeedback = 'Good performance with some improvements needed.';
    else if (avgScore >= 4) overallFeedback = 'Average performance. Practice more.';
    else overallFeedback = 'Needs improvement. Focus on fundamentals.';

    session.status = 'completed';
    session.totalScore = totalScore;
    session.averageScore = Number(avgScore.toFixed(1));
    session.overallFeedback = overallFeedback;
    session.completedAt = new Date();

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SESSION HISTORY
exports.getSessionHistory = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      status: 'completed'
    })
      .populate('interviewId', 'title category difficulty')
      .sort('-completedAt')
      .limit(20);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE SESSION
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate('interviewId', 'title category difficulty duration');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const Interview = require('../model/Interview');
const Question = require('../model/Question');
const User=require("../model/User")

// GET ALL INTERVIEWS
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('questions', 'text difficulty timeLimit').populate("createdBy")
      .sort('-createdAt');

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnroleInterview = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Correct way to find user
    const userExist = await User.findById(id);

    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Get interview IDs from applyFor
    const interviewIds = userExist.applyFor || [];

    // ✅ Fetch only those interviews
    const interviews = await Interview.find({
      _id: { $in: interviewIds }
    });

    return res.status(200).json({
      message: "Enrolled interviews fetched successfully",
      data: interviews
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// GET SINGLE INTERVIEW
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('questions');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInterview = async (req, res) => {
  try {

    const { category } = req.body
    const existCat = await Interview.findOne({ category })

    if (existCat) {
      return res.status(404).json({ message: "Interview category already exist" })
    }

    await Interview.create(req.body)

    return res.status(201).json({ message: "Successfully create new Interview" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateInterview = async (req, res) => {
  try {
    const { id } = req.params
    const { title, difficulty, duration, description, createdBy, isActive, category } = req.body
    const updatedInterview = await Interview.findByIdAndUpdate(id, { title, difficulty, duration, description, createdBy, isActive, category }, { new: true, runValidator: true })

    if (!updatedInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(updatedInterview)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addBuildQuestionIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIds } = req.body;

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // ✅ Add without duplicates
    interview.questions = [
      ...new Set([
        ...interview.questions.map(q => q.toString()),
        ...questionIds
      ])
    ];

    await interview.save();

    res.json({
      message: "Questions added successfully",
      data: interview
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// SEED INTERVIEWS + QUESTIONS
exports.seedInterviews = async (req, res) => {
  try {
    const questionsData = [
      // Frontend
      { text: "Explain the difference between var, let, and const in JavaScript.", category: "Frontend", difficulty: "Easy", timeLimit: 90 },
      { text: "What is the Virtual DOM in React and how does it improve performance?", category: "Frontend", difficulty: "Medium", timeLimit: 120 },
      { text: "Explain CSS Flexbox and Grid layout systems. When would you use each?", category: "Frontend", difficulty: "Medium", timeLimit: 120 },
      { text: "What are React Hooks? Explain useState and useEffect with examples.", category: "Frontend", difficulty: "Medium", timeLimit: 150 },
      { text: "How does event bubbling and event delegation work in JavaScript?", category: "Frontend", difficulty: "Medium", timeLimit: 100 },

      // Backend
      { text: "What is REST API? Explain the principles of RESTful architecture.", category: "Backend", difficulty: "Easy", timeLimit: 90 },
      { text: "Explain the difference between SQL and NoSQL databases. When to use each?", category: "Backend", difficulty: "Medium", timeLimit: 120 },
      { text: "What is middleware in Express.js? Give practical examples.", category: "Backend", difficulty: "Medium", timeLimit: 100 },
      { text: "How does JWT authentication work? Explain the token lifecycle.", category: "Backend", difficulty: "Medium", timeLimit: 120 },
      { text: "What is indexing in MongoDB? How does it improve query performance?", category: "Backend", difficulty: "Hard", timeLimit: 150 },

      // Behavioral
      { text: "Tell me about a challenging project you worked on and how you overcame obstacles.", category: "Behavioral", difficulty: "Medium", timeLimit: 180 },
      { text: "Describe a situation where you had to work with a difficult team member.", category: "Behavioral", difficulty: "Medium", timeLimit: 150 },
      { text: "Where do you see yourself in 5 years? What are your career goals?", category: "Behavioral", difficulty: "Easy", timeLimit: 120 },


      //  primary school
      { text: "Spell the word 'Dog'.", category: "Primary", difficulty: "Easy", timeLimit: 60 },
      { text: "Spell the word 'Apple'.", category: "Primary", difficulty: "Easy", timeLimit: 60 },
      { text: "Spell the word 'Blue'.", category: "Primary", difficulty: "Easy", timeLimit: 60 },
      { text: "Spell the word 'School'.", category: "Primary", difficulty: "Easy", timeLimit: 60 },
      { text: "Spell the word 'Small'.", category: "Primary", difficulty: "Easy", timeLimit: 60 }

    ];

    const questions = await Question.insertMany(questionsData);

    const frontendQs = questions.filter(q => q.category === 'Frontend').map(q => q._id);
    const backendQs = questions.filter(q => q.category === 'Backend').map(q => q._id);
    const behavioralQs = questions.filter(q => q.category === 'Behavioral').map(q => q._id);
    const behavioralPrimary = questions.filter(q => q.category === 'BehavioralPrimary').map(q => q._id);


    await Interview.insertMany([
      {
        title: 'Frontend Developer Interview',
        description: 'Comprehensive frontend assessment covering JavaScript, React, and CSS concepts.',
        category: 'Frontend',
        difficulty: 'Medium',
        duration: 45,
        questions: frontendQs,
        createdBy: req.user._id
      },
      {
        title: 'Backend Developer Interview',
        description: 'In-depth backend assessment covering Node.js, databases, and API design.',
        category: 'Backend',
        difficulty: 'Medium',
        duration: 40,
        questions: backendQs,
        createdBy: req.user._id
      },
      {
        title: 'Behavioral & HR Interview',
        description: 'Soft skills and situational interview to assess culture fit and communication.',
        category: 'Behavioral',
        difficulty: 'Easy',
        duration: 30,
        questions: behavioralQs,
        createdBy: req.user._id
      },
      {
        title: 'Primary School',
        description: 'Soft skills and situational interview to assess culture fit and communication.',
        category: 'BehavioralPrimary',
        difficulty: 'Easy',
        duration: 10,
        questions: behavioralPrimary,
        createdBy: req.user._id
      }
    ]);

    res.json({ message: 'Sample data seeded successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
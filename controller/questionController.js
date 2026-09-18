const Question = require('../model/Question');

// GET QUESTIONS (with filters)
exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter).populate("createdBy");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE QUESTION
exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuestion=async(req,res)=>{
  try{
     await Question.findByIdAndDelete(req.query.id)
     res.status(200).json({message:"Delete Question"})
  }catch(err){
    res.status(500).json({message:err.message})
  }
}

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params; // better than query
    const { category, difficulty, timeLimit, text,createdBy } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        category,
        difficulty,
        timeLimit,
        text,
        createdBy
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(updatedQuestion);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

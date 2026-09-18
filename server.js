require('dotenv').config();;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes=require("./routes/authRoutes")
const interviewRoutes=require("./routes/interviews")
const questionRoutes=require("./routes/questions")
const sessionRoutes=require("./routes/sessions")






const app = express();

// Middleware
app.use(cors({
  // origin: ["https://ai-interview-t6vs.vercel.app",'http://localhost:5173',process.env.URL],
  origin: ['http://localhost:5173'],

  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Interview Platform API Running' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const PORT =5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
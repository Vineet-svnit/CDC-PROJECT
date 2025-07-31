const mongoose = require('mongoose');
const Test = require('../models/test'); // Replace with your actual model path

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/CDCproject');

// Sample questions data
const sampleQuestions = [
  // SCQ (Single Choice Questions)
  {
    question: "What is the capital of France?",
    _type: "SCQ",
    option1: "London",
    option2: "Paris",
    option3: "Berlin",
    option4: "Madrid",
    answer: "B"
  },
  {
    question: "Which planet is known as the Red Planet?",
    _type: "SCQ",
    option1: "Venus",
    option2: "Mars",
    option3: "Jupiter",
    option4: "Saturn",
    answer: "B"
  },
  {
    question: "What is 2 + 2?",
    _type: "SCQ",
    option1: "3",
    option2: "4",
    option3: "5",
    option4: "6",
    answer: "B"
  },
  {
    questionImage: "https://example.com/math-equation.png",
    question: "Solve the equation shown in the image",
    _type: "SCQ",
    option1: "x = 1",
    option2: "x = 2",
    option3: "x = 3",
    option4: "x = 4",
    answer: "C"
  },

  // MCQ (Multiple Choice Questions)
  {
    question: "Which of the following are programming languages?",
    _type: "MCQ",
    option1: "JavaScript",
    option2: "HTML",
    option3: "Python",
    option4: "CSS",
    answer: "AC" // JavaScript and Python
  },
  {
    question: "Select all prime numbers",
    _type: "MCQ",
    option1: "1",
    option2: "2",
    option3: "3",
    option4: "4",
    answer: "BC" // 2 and 3
  },
  {
    questionImage: "https://example.com/periodic-table.png",
    question: "Which elements shown are noble gases?",
    _type: "MCQ",
    image1: "https://example.com/helium.png",
    option1: "Helium",
    image2: "https://example.com/oxygen.png",
    option2: "Oxygen",
    image3: "https://example.com/neon.png",
    option3: "Neon",
    image4: "https://example.com/nitrogen.png",
    option4: "Nitrogen",
    answer: "AC" // Helium and Neon
  }
];

// Generate test data
const generateMockTests = async () => {
  try {
    // Clear existing tests
    await Test.deleteMany({});

    // Create sample tests
    const test1 = new Test({
      testName: "General Knowledge Quiz",
      startTime: new Date("2023-06-15T10:00:00Z"),
      endTime: new Date("2023-06-15T12:00:00Z"),
      duration: 120, // 2 hours in minutes
      numberOfQues: 5,
      totalMarks: 50,
      questions: sampleQuestions.slice(0, 5) // First 5 questions
    });

    const test2 = new Test({
      testName: "Science and Technology Test",
      startTime: new Date("2023-06-20T14:00:00Z"),
      endTime: new Date("2023-06-20T15:30:00Z"),
      duration: 90, // 1.5 hours in minutes
      numberOfQues: 7,
      totalMarks: 70,
      questions: sampleQuestions // All questions
    });

    // Save to database
    await test1.save();
    await test2.save();

    console.log("Mock tests created successfully!");
    console.log(`Created 2 tests with ${sampleQuestions.length} sample questions`);

    mongoose.disconnect();
  } catch (err) {
    console.error("Error creating mock data:", err);
    mongoose.disconnect();
  }
};

// Run the generator
generateMockTests();
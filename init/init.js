const mongoose = require('mongoose');
const Question = require('../models/question'); // Replace with your actual model path

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/CDCproject');

// Sample questions data
const sampleQuestions = [
  // SCQ - Single Choice Questions
  {
    question: "What is the next number in the sequence: 2, 4, 8, 16, ...?",
    _type: "SCQ",
    option1: "18",
    option2: "20",
    option3: "32",
    option4: "24",
    answer: "C"
  },
  {
    question: "If a shirt costs $40 after a 20% discount, what was the original price?",
    _type: "SCQ",
    option1: "$48",
    option2: "$50",
    option3: "$60",
    option4: "$80",
    answer: "C"
  },
  {
    question: "Which number is the smallest prime?",
    _type: "SCQ",
    option1: "0",
    option2: "1",
    option3: "2",
    option4: "3",
    answer: "C"
  },
  {
    question: "What is the average of the first five even numbers?",
    _type: "SCQ",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "6",
    answer: "D"
  },
  {
    question: "Ravi is older than Amit but younger than Suresh. Who is the oldest?",
    _type: "SCQ",
    option1: "Ravi",
    option2: "Amit",
    option3: "Suresh",
    option4: "Cannot determine",
    answer: "C"
  },
  {
    question: "If SELL is coded as 1233, what is LESS?",
    _type: "SCQ",
    option1: "3122",
    option2: "3211",
    option3: "2331",
    option4: "3213",
    answer: "D"
  },
  {
    question: "Find the odd one out: Apple, Orange, Banana, Carrot",
    _type: "SCQ",
    option1: "Apple",
    option2: "Orange",
    option3: "Banana",
    option4: "Carrot",
    answer: "D"
  },
  {
    question: "Which of the following is a square number?",
    _type: "SCQ",
    option1: "16",
    option2: "24",
    option3: "28",
    option4: "30",
    answer: "A"
  },
  {
    question: "Which day follows two days after Monday?",
    _type: "SCQ",
    option1: "Wednesday",
    option2: "Tuesday",
    option3: "Friday",
    option4: "Thursday",
    answer: "A"
  },
  {
    question: "If 5x = 20, what is x?",
    _type: "SCQ",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "5",
    answer: "C"
  },
  {
    question: "Which shape has 4 equal sides and 4 right angles?",
    _type: "SCQ",
    option1: "Rectangle",
    option2: "Triangle",
    option3: "Square",
    option4: "Circle",
    answer: "C"
  },
  {
    question: "Which is not a multiple of 3?",
    _type: "SCQ",
    option1: "9",
    option2: "18",
    option3: "15",
    option4: "22",
    answer: "D"
  },
  {
    question: "If all cats are animals and some animals are wild, then some cats are:",
    _type: "SCQ",
    option1: "Wild",
    option2: "Not animals",
    option3: "Domesticated",
    option4: "None of these",
    answer: "D"
  },
  {
    question: "A train travels at 60 km/h. How far will it go in 45 minutes?",
    _type: "SCQ",
    option1: "30 km",
    option2: "45 km",
    option3: "60 km",
    option4: "15 km",
    answer: "A"
  },
  {
    question: "What is the value of 7 × 6 – 5?",
    _type: "SCQ",
    option1: "37",
    option2: "32",
    option3: "42",
    option4: "29",
    answer: "A"
  },
  {
    question: "Which is the next term in the series: 3, 6, 12, 24, ...?",
    _type: "SCQ",
    option1: "34",
    option2: "48",
    option3: "50",
    option4: "30",
    answer: "B"
  },
  {
    question: "What is the perimeter of a rectangle with length 8 cm and breadth 6 cm?",
    _type: "SCQ",
    option1: "14 cm",
    option2: "24 cm",
    option3: "26 cm",
    option4: "28 cm",
    answer: "B"
  },
  {
    question: "Rahul ranks 5th from top and 38th from the bottom. How many students are in the class?",
    _type: "SCQ",
    option1: "41",
    option2: "42",
    option3: "43",
    option4: "44",
    answer: "B"
  },
  {
    question: "If ‘EARTH’ is coded as ‘GCTKV’, how is ‘MOON’ coded?",
    _type: "SCQ",
    option1: "OQQP",
    option2: "OQPP",
    option3: "OORQ",
    option4: "QSQP",
    answer: "A"
  },
  {
    question: "Which number is formed by the product of its digits: 36, 24, 12, 10?",
    _type: "SCQ",
    option1: "36",
    option2: "24",
    option3: "12",
    option4: "10",
    answer: "C"
  },
  // (Keep going here ... covering all topics as requested)
  {
    question: "Arrange in ascending order: 0.77, 0.707, 0.7, 0.777",
    _type: "SCQ",
    option1: "0.7, 0.707, 0.77, 0.777",
    option2: "0.707, 0.7, 0.77, 0.777",
    option3: "0.777, 0.77, 0.707, 0.7",
    option4: "0.7, 0.77, 0.707, 0.777",
    answer: "A"
  },
  {
    question: "If the sum of two consecutive numbers is 41, what are the numbers?",
    _type: "SCQ",
    option1: "20, 21",
    option2: "21, 22",
    option3: "22, 23",
    option4: "19, 20",
    answer: "A"
  },
  {
    question: "Find the odd one out: 2, 6, 12, 20, 28, 35, 42",
    _type: "SCQ",
    option1: "12",
    option2: "20",
    option3: "35",
    option4: "28",
    answer: "C"
  },
  {
    question: "If a pen costs Rs. 10 and a notebook costs Rs. 15, what is the total cost of 2 pens and 3 notebooks?",
    _type: "SCQ",
    option1: "55",
    option2: "65",
    option3: "60",
    option4: "45",
    answer: "C"
  },
  {
    question: "What is the sum of angles in a triangle?",
    _type: "SCQ",
    option1: "90°",
    option2: "180°",
    option3: "270°",
    option4: "360°",
    answer: "B"
  },
  {
    question: "Find X: 14, 28, X, 112, 224",
    _type: "SCQ",
    option1: "42",
    option2: "56",
    option3: "84",
    option4: "72",
    answer: "B"
  },
  {
    question: "Which shape does not have parallel sides?",
    _type: "SCQ",
    option1: "Rectangle",
    option2: "Trapezium",
    option3: "Triangle",
    option4: "Square",
    answer: "C"
  },
  {
    question: "If 6x + 1 = 19, what is x?",
    _type: "SCQ",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "5",
    answer: "D"
  },
  {
    question: "If a:b = 2:5 and b:c = 3:4, find a:b:c",
    _type: "SCQ",
    option1: "6:15:20",
    option2: "2:3:4",
    option3: "4:5:6",
    option4: "3:4:5",
    answer: "A"
  },
  {
    question: "The average of 4, 8, 12, 16 is:",
    _type: "SCQ",
    option1: "9",
    option2: "10",
    option3: "12",
    option4: "14",
    answer: "B"
  },
  {
    question: "Which of the following is divisible by 11?",
    _type: "SCQ",
    option1: "111",
    option2: "550",
    option3: "671",
    option4: "154",
    answer: "B"
  },
  {
    question: "How many diagonals does a pentagon have?",
    _type: "SCQ",
    option1: "5",
    option2: "7",
    option3: "10",
    option4: "8",
    answer: "A"
  },
  {
    question: "The value of (9+6) × (4–2) = ?",
    _type: "SCQ",
    option1: "30",
    option2: "32",
    option3: "36",
    option4: "40",
    answer: "C"
  },
  {
    question: "If P = 2Q and Q = 3R, then P:R is:",
    _type: "SCQ",
    option1: "2:3",
    option2: "3:2",
    option3: "6:1",
    option4: "1:6",
    answer: "C"
  },
  {
    question: "If an article is sold at Rs. 242 with a loss of 15%, what is the cost price?",
    _type: "SCQ",
    option1: "275",
    option2: "285",
    option3: "242",
    option4: "258",
    answer: "A"
  },
  {
    question: "Which of these is an even number?",
    _type: "SCQ",
    option1: "13",
    option2: "23",
    option3: "36",
    option4: "35",
    answer: "C"
  },
  {
    question: "Rita bought a book for Rs.80 and sold it for Rs.100. What is her profit percent?",
    _type: "SCQ",
    option1: "20%",
    option2: "25%",
    option3: "30%",
    option4: "12.5%",
    answer: "B"
  },
  {
    question: "Which is the odd one out? Rose, Lily, Lotus, Mango",
    _type: "SCQ",
    option1: "Rose",
    option2: "Lily",
    option3: "Lotus",
    option4: "Mango",
    answer: "D"
  },
  {
    question: "Which of the following statements is true?",
    _type: "SCQ",
    option1: "All square numbers are even",
    option2: "Only odd numbers can be prime",
    option3: "75 is divisible by 5",
    option4: "Squares and cubes are always equal",
    answer: "C"
  },
  {
    question: "If 15 pencils cost Rs.45, what is the cost of 25 pencils?",
    _type: "SCQ",
    option1: "65",
    option2: "70",
    option3: "75",
    option4: "80",
    answer: "C"
  },
  {
    question: "42 ÷ 7 x 3 = ?",
    _type: "SCQ",
    option1: "18",
    option2: "12",
    option3: "15",
    option4: "21",
    answer: "C"
  },
  // MCQ - Multiple Choice Questions 
  {
    question: "Select the odd numbers",
    _type: "MCQ",
    option1: "17",
    option2: "22",
    option3: "13",
    option4: "18",
    answer: "AC"
  },
  {
    question: "Which of the following are fruits?",
    _type: "MCQ",
    option1: "Apple",
    option2: "Potato",
    option3: "Mango",
    option4: "Carrot",
    answer: "AC"
  },
  {
    question: "Pick the prime numbers",
    _type: "MCQ",
    option1: "2",
    option2: "4",
    option3: "5",
    option4: "6",
    answer: "AC"
  },
  {
    question: "Select all multiples of 4",
    _type: "MCQ",
    option1: "8",
    option2: "10",
    option3: "12",
    option4: "13",
    answer: "AC"
  },
  {
    question: "Which of the following are squares of integers?",
    _type: "MCQ",
    option1: "25",
    option2: "16",
    option3: "36",
    option4: "30",
    answer: "ABC"
  },
  {
    question: "Choose all vowels",
    _type: "MCQ",
    option1: "A",
    option2: "B",
    option3: "E",
    option4: "F",
    answer: "AC"
  },
  {
    question: "Select the correct statements:",
    _type: "MCQ",
    option1: "All dogs are mammals.",
    option2: "Some birds are mammals.",
    option3: "All fish can fly.",
    option4: "All snakes are reptiles.",
    answer: "AD"
  },
  {
    question: "Which of the following have a right angle?",
    _type: "MCQ",
    option1: "Square",
    option2: "Rectangle",
    option3: "Triangle",
    option4: "Parallelogram",
    answer: "AB"
  },
  {
    question: "Pick the correct spelling(s):",
    _type: "MCQ",
    option1: "Accomodate",
    option2: "Accommodate",
    option3: "Receive",
    option4: "Recieve",
    answer: "BC"
  },
  {
    question: "Water boils at which temperatures?",
    _type: "MCQ",
    option1: "100°C",
    option2: "212°F",
    option3: "0°C",
    option4: "0°F",
    answer: "AB"
  },
  {
    question: "Find the mammals:",
    _type: "MCQ",
    option1: "Cat",
    option2: "Cow",
    option3: "Sparrow",
    option4: "Dog",
    answer: "ABD"
  },
  {
    question: "Which objects are transparent?",
    _type: "MCQ",
    option1: "Glass",
    option2: "Wood",
    option3: "Plastic bag",
    option4: "Air",
    answer: "ACD"
  },
  {
    question: "Which are Indian rivers?",
    _type: "MCQ",
    option1: "Ganga",
    option2: "Nile",
    option3: "Yamuna",
    option4: "Amazon",
    answer: "AC"
  },
  {
    question: "Find the geometric shapes:",
    _type: "MCQ",
    option1: "Circle",
    option2: "Rectangle",
    option3: "Hexagon",
    option4: "Polygon",
    answer: "ABCD"
  },
  {
    question: "Which of these are programming languages?",
    _type: "MCQ",
    option1: "Python",
    option2: "Ruby",
    option3: "Apple",
    option4: "Go",
    answer: "ABD"
  },
  {
    question: "Which statements are correct about humans?",
    _type: "MCQ",
    option1: "Have lungs",
    option2: "Can fly naturally",
    option3: "Have a brain",
    option4: "Live on Earth",
    answer: "ACD"
  },
  {
    question: "Choose all cube numbers",
    _type: "MCQ",
    option1: "8",
    option2: "9",
    option3: "27",
    option4: "64",
    answer: "ACD"
  },
  {
    question: "Pick leap years",
    _type: "MCQ",
    option1: "2000",
    option2: "2018",
    option3: "2020",
    option4: "2100",
    answer: "AC"
  },
  {
    question: "Find the correct pairs for countries and capitals",
    _type: "MCQ",
    option1: "France - Paris",
    option2: "India - Delhi",
    option3: "USA - New York",
    option4: "Japan - Tokyo",
    answer: "ABD"
  },
  {
    question: "Which of these are odd numbers?",
    _type: "MCQ",
    option1: "31",
    option2: "52",
    option3: "47",
    option4: "88",
    answer: "AC"
  },
  {
    question: "Pick healthy habits",
    _type: "MCQ",
    option1: "Brushing teeth",
    option2: "Smoking",
    option3: "Regular exercise",
    option4: "Overeating",
    answer: "AC"
  },
  {
    question: "Choose all instruments used for measuring",
    _type: "MCQ",
    option1: "Thermometer",
    option2: "Barometer",
    option3: "Stethoscope",
    option4: "Speedometer",
    answer: "ABD"
  },
  {
    question: "Which are types of triangles?",
    _type: "MCQ",
    option1: "Isosceles",
    option2: "Equilateral",
    option3: "Scalene",
    option4: "Pentagon",
    answer: "ABC"
  },
  {
    question: "Pick the odd numbers",
    _type: "MCQ",
    option1: "13",
    option2: "18",
    option3: "23",
    option4: "20",
    answer: "AC"
  },
  {
    question: "Which of these are Indian states?",
    _type: "MCQ",
    option1: "Kerala",
    option2: "Queensland",
    option3: "Punjab",
    option4: "California",
    answer: "AC"
  },
  {
    question: "Find the mammals from the list",
    _type: "MCQ",
    option1: "Lion",
    option2: "Crocodile",
    option3: "Dog",
    option4: "Parrot",
    answer: "AC"
  },
  {
    question: "Which of the following are parts of a plant?",
    _type: "MCQ",
    option1: "Root",
    option2: "Leaf",
    option3: "Stem",
    option4: "Stone",
    answer: "ABC"
  },
  {
    question: "Pick the colors in the Indian flag",
    _type: "MCQ",
    option1: "Orange",
    option2: "Green",
    option3: "Blue",
    option4: "Black",
    answer: "ABC"
  },
  {
    question: "Select all prime numbers",
    _type: "MCQ",
    option1: "7",
    option2: "9",
    option3: "11",
    option4: "12",
    answer: "AC"
  },
  {
    question: "Find vegetables from the following",
    _type: "MCQ",
    option1: "Spinach",
    option2: "Banana",
    option3: "Potato",
    option4: "Mango",
    answer: "AC"
  },
  {
    question: "Choose the basic operations in arithmetic",
    _type: "MCQ",
    option1: "Addition",
    option2: "Division",
    option3: "Multiplication",
    option4: "Exponentiation",
    answer: "ABC"
  },
  {
    question: "What is the next number in the sequence: 2, 4, 8, 16, ...?",
    _type: "SCQ",
    option1: "18",
    option2: "20",
    option3: "32",
    option4: "24",
    answer: "C"
  },
  {
    question: "If a shirt costs $40 after a 20% discount, what was the original price?",
    _type: "SCQ",
    option1: "$48",
    option2: "$50",
    option3: "$60",
    option4: "$80",
    answer: "C"
  },
  {
    question: "Which number is the smallest prime?",
    _type: "SCQ",
    option1: "0",
    option2: "1",
    option3: "2",
    option4: "3",
    answer: "C"
  },
  {
    question: "What is the average of the first five even numbers?",
    _type: "SCQ",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "6",
    answer: "D"
  },
  {
    question: "Ravi is older than Amit but younger than Suresh. Who is the oldest?",
    _type: "SCQ",
    option1: "Ravi",
    option2: "Amit",
    option3: "Suresh",
    option4: "Cannot determine",
    answer: "C"
  },
  {
    question: "If SELL is coded as 1233, what is LESS?",
    _type: "SCQ",
    option1: "3122",
    option2: "3211",
    option3: "2331",
    option4: "3213",
    answer: "D"
  },
  {
    question: "Find the odd one out: Apple, Orange, Banana, Carrot",
    _type: "SCQ",
    option1: "Apple",
    option2: "Orange",
    option3: "Banana",
    option4: "Carrot",
    answer: "D"
  },
  {
    question: "Which of the following is a square number?",
    _type: "SCQ",
    option1: "16",
    option2: "24",
    option3: "28",
    option4: "30",
    answer: "A"
  },
  {
    question: "Which day follows two days after Monday?",
    _type: "SCQ",
    option1: "Wednesday",
    option2: "Tuesday",
    option3: "Friday",
    option4: "Thursday",
    answer: "A"
  },
  {
    question: "If 5x = 20, what is x?",
    _type: "SCQ",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "5",
    answer: "C"
  },
  {
    question: "Which shape has 4 equal sides and 4 right angles?",
    _type: "SCQ",
    option1: "Rectangle",
    option2: "Triangle",
    option3: "Square",
    option4: "Circle",
    answer: "C"
  },
  {
    question: "Which is not a multiple of 3?",
    _type: "SCQ",
    option1: "9",
    option2: "18",
    option3: "15",
    option4: "22",
    answer: "D"
  },
  {
    question: "If all cats are animals and some animals are wild, then some cats are:",
    _type: "SCQ",
    option1: "Wild",
    option2: "Not animals",
    option3: "Domesticated",
    option4: "None of these",
    answer: "D"
  },
  {
    question: "A train travels at 60 km/h. How far will it go in 45 minutes?",
    _type: "SCQ",
    option1: "30 km",
    option2: "45 km",
    option3: "60 km",
    option4: "15 km",
    answer: "A"
  },
  {
    question: "What is the value of 7 × 6 – 5?",
    _type: "SCQ",
    option1: "37",
    option2: "32",
    option3: "42",
    option4: "29",
    answer: "A"
  },
  {
    question: "Which is the next term in the series: 3, 6, 12, 24, ...?",
    _type: "SCQ",
    option1: "34",
    option2: "48",
    option3: "50",
    option4: "30",
    answer: "B"
  },
  {
    question: "What is the perimeter of a rectangle with length 8 cm and breadth 6 cm?",
    _type: "SCQ",
    option1: "14 cm",
    option2: "24 cm",
    option3: "26 cm",
    option4: "28 cm",
    answer: "B"
  },
  {
    question: "Rahul ranks 5th from top and 38th from the bottom. How many students are in the class?",
    _type: "SCQ",
    option1: "41",
    option2: "42",
    option3: "43",
    option4: "44",
    answer: "B"
  },
  {
    question: "If ‘EARTH’ is coded as ‘GCTKV’, how is ‘MOON’ coded?",
    _type: "SCQ",
    option1: "OQQP",
    option2: "OQPP",
    option3: "OORQ",
    option4: "QSQP",
    answer: "A"
  },
  {
    question: "Which number is formed by the product of its digits: 36, 24, 12, 10?",
    _type: "SCQ",
    option1: "36",
    option2: "24",
    option3: "12",
    option4: "10",
    answer: "C"
  },
  // (Keep going here ... covering all topics as requested)
  {
    question: "Arrange in ascending order: 0.77, 0.707, 0.7, 0.777",
    _type: "SCQ",
    option1: "0.7, 0.707, 0.77, 0.777",
    option2: "0.707, 0.7, 0.77, 0.777",
    option3: "0.777, 0.77, 0.707, 0.7",
    option4: "0.7, 0.77, 0.707, 0.777",
    answer: "A"
  },
  {
    question: "If the sum of two consecutive numbers is 41, what are the numbers?",
    _type: "SCQ",
    option1: "20, 21",
    option2: "21, 22",
    option3: "22, 23",
    option4: "19, 20",
    answer: "A"
  },
  {
    question: "Find the odd one out: 2, 6, 12, 20, 28, 35, 42",
    _type: "SCQ",
    option1: "12",
    option2: "20",
    option3: "35",
    option4: "28",
    answer: "C"
  },
  {
    question: "If a pen costs Rs. 10 and a notebook costs Rs. 15, what is the total cost of 2 pens and 3 notebooks?",
    _type: "SCQ",
    option1: "55",
    option2: "65",
    option3: "60",
    option4: "45",
    answer: "C"
  },
  {
    question: "What is the sum of angles in a triangle?",
    _type: "SCQ",
    option1: "90°",
    option2: "180°",
    option3: "270°",
    option4: "360°",
    answer: "B"
  },
  {
    question: "Find X: 14, 28, X, 112, 224",
    _type: "SCQ",
    option1: "42",
    option2: "56",
    option3: "84",
    option4: "72",
    answer: "B"
  },
  {
    question: "Which shape does not have parallel sides?",
    _type: "SCQ",
    option1: "Rectangle",
    option2: "Trapezium",
    option3: "Triangle",
    option4: "Square",
    answer: "C"
  },
  {
    question: "If 6x + 1 = 19, what is x?",
    _type: "SCQ",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "5",
    answer: "D"
  },
  {
    question: "If a:b = 2:5 and b:c = 3:4, find a:b:c",
    _type: "SCQ",
    option1: "6:15:20",
    option2: "2:3:4",
    option3: "4:5:6",
    option4: "3:4:5",
    answer: "A"
  },
  {
    question: "The average of 4, 8, 12, 16 is:",
    _type: "SCQ",
    option1: "9",
    option2: "10",
    option3: "12",
    option4: "14",
    answer: "B"
  },
  {
    question: "Which of the following is divisible by 11?",
    _type: "SCQ",
    option1: "111",
    option2: "550",
    option3: "671",
    option4: "154",
    answer: "B"
  },
  {
    question: "How many diagonals does a pentagon have?",
    _type: "SCQ",
    option1: "5",
    option2: "7",
    option3: "10",
    option4: "8",
    answer: "A"
  },
  {
    question: "The value of (9+6) × (4–2) = ?",
    _type: "SCQ",
    option1: "30",
    option2: "32",
    option3: "36",
    option4: "40",
    answer: "C"
  },
  {
    question: "If P = 2Q and Q = 3R, then P:R is:",
    _type: "SCQ",
    option1: "2:3",
    option2: "3:2",
    option3: "6:1",
    option4: "1:6",
    answer: "C"
  },
  {
    question: "If an article is sold at Rs. 242 with a loss of 15%, what is the cost price?",
    _type: "SCQ",
    option1: "275",
    option2: "285",
    option3: "242",
    option4: "258",
    answer: "A"
  },
  {
    question: "Which of these is an even number?",
    _type: "SCQ",
    option1: "13",
    option2: "23",
    option3: "36",
    option4: "35",
    answer: "C"
  },
  {
    question: "Rita bought a book for Rs.80 and sold it for Rs.100. What is her profit percent?",
    _type: "SCQ",
    option1: "20%",
    option2: "25%",
    option3: "30%",
    option4: "12.5%",
    answer: "B"
  },
  {
    question: "Which is the odd one out? Rose, Lily, Lotus, Mango",
    _type: "SCQ",
    option1: "Rose",
    option2: "Lily",
    option3: "Lotus",
    option4: "Mango",
    answer: "D"
  },
  {
    question: "Which of the following statements is true?",
    _type: "SCQ",
    option1: "All square numbers are even",
    option2: "Only odd numbers can be prime",
    option3: "75 is divisible by 5",
    option4: "Squares and cubes are always equal",
    answer: "C"
  },
  {
    question: "If 15 pencils cost Rs.45, what is the cost of 25 pencils?",
    _type: "SCQ",
    option1: "65",
    option2: "70",
    option3: "75",
    option4: "80",
    answer: "C"
  },
  {
    question: "42 ÷ 7 x 3 = ?",
    _type: "SCQ",
    option1: "18",
    option2: "12",
    option3: "15",
    option4: "21",
    answer: "C"
  },
  // MCQ - Multiple Choice Questions 
  {
    question: "Select the odd numbers",
    _type: "MCQ",
    option1: "17",
    option2: "22",
    option3: "13",
    option4: "18",
    answer: "AC"
  },
  {
    question: "Which of the following are fruits?",
    _type: "MCQ",
    option1: "Apple",
    option2: "Potato",
    option3: "Mango",
    option4: "Carrot",
    answer: "AC"
  },
  {
    question: "Pick the prime numbers",
    _type: "MCQ",
    option1: "2",
    option2: "4",
    option3: "5",
    option4: "6",
    answer: "AC"
  },
  {
    question: "Select all multiples of 4",
    _type: "MCQ",
    option1: "8",
    option2: "10",
    option3: "12",
    option4: "13",
    answer: "AC"
  },
  {
    question: "Which of the following are squares of integers?",
    _type: "MCQ",
    option1: "25",
    option2: "16",
    option3: "36",
    option4: "30",
    answer: "ABC"
  },
  {
    question: "Choose all vowels",
    _type: "MCQ",
    option1: "A",
    option2: "B",
    option3: "E",
    option4: "F",
    answer: "AC"
  },
  {
    question: "Select the correct statements:",
    _type: "MCQ",
    option1: "All dogs are mammals.",
    option2: "Some birds are mammals.",
    option3: "All fish can fly.",
    option4: "All snakes are reptiles.",
    answer: "AD"
  },
  {
    question: "Which of the following have a right angle?",
    _type: "MCQ",
    option1: "Square",
    option2: "Rectangle",
    option3: "Triangle",
    option4: "Parallelogram",
    answer: "AB"
  },
  {
    question: "Pick the correct spelling(s):",
    _type: "MCQ",
    option1: "Accomodate",
    option2: "Accommodate",
    option3: "Receive",
    option4: "Recieve",
    answer: "BC"
  },
  {
    question: "Water boils at which temperatures?",
    _type: "MCQ",
    option1: "100°C",
    option2: "212°F",
    option3: "0°C",
    option4: "0°F",
    answer: "AB"
  },
  {
    question: "Find the mammals:",
    _type: "MCQ",
    option1: "Cat",
    option2: "Cow",
    option3: "Sparrow",
    option4: "Dog",
    answer: "ABD"
  },
  {
    question: "Which objects are transparent?",
    _type: "MCQ",
    option1: "Glass",
    option2: "Wood",
    option3: "Plastic bag",
    option4: "Air",
    answer: "ACD"
  },
  {
    question: "Which are Indian rivers?",
    _type: "MCQ",
    option1: "Ganga",
    option2: "Nile",
    option3: "Yamuna",
    option4: "Amazon",
    answer: "AC"
  },
  {
    question: "Find the geometric shapes:",
    _type: "MCQ",
    option1: "Circle",
    option2: "Rectangle",
    option3: "Hexagon",
    option4: "Polygon",
    answer: "ABCD"
  },
  {
    question: "Which of these are programming languages?",
    _type: "MCQ",
    option1: "Python",
    option2: "Ruby",
    option3: "Apple",
    option4: "Go",
    answer: "ABD"
  },
  {
    question: "Which statements are correct about humans?",
    _type: "MCQ",
    option1: "Have lungs",
    option2: "Can fly naturally",
    option3: "Have a brain",
    option4: "Live on Earth",
    answer: "ACD"
  },
  {
    question: "Choose all cube numbers",
    _type: "MCQ",
    option1: "8",
    option2: "9",
    option3: "27",
    option4: "64",
    answer: "ACD"
  },
  {
    question: "Pick leap years",
    _type: "MCQ",
    option1: "2000",
    option2: "2018",
    option3: "2020",
    option4: "2100",
    answer: "AC"
  },
  {
    question: "Find the correct pairs for countries and capitals",
    _type: "MCQ",
    option1: "France - Paris",
    option2: "India - Delhi",
    option3: "USA - New York",
    option4: "Japan - Tokyo",
    answer: "ABD"
  },
  {
    question: "Which of these are odd numbers?",
    _type: "MCQ",
    option1: "31",
    option2: "52",
    option3: "47",
    option4: "88",
    answer: "AC"
  },
  {
    question: "Pick healthy habits",
    _type: "MCQ",
    option1: "Brushing teeth",
    option2: "Smoking",
    option3: "Regular exercise",
    option4: "Overeating",
    answer: "AC"
  },
  {
    question: "Choose all instruments used for measuring",
    _type: "MCQ",
    option1: "Thermometer",
    option2: "Barometer",
    option3: "Stethoscope",
    option4: "Speedometer",
    answer: "ABD"
  },
  {
    question: "Which are types of triangles?",
    _type: "MCQ",
    option1: "Isosceles",
    option2: "Equilateral",
    option3: "Scalene",
    option4: "Pentagon",
    answer: "ABC"
  },
  {
    question: "Pick the odd numbers",
    _type: "MCQ",
    option1: "13",
    option2: "18",
    option3: "23",
    option4: "20",
    answer: "AC"
  },
  {
    question: "Which of these are Indian states?",
    _type: "MCQ",
    option1: "Kerala",
    option2: "Queensland",
    option3: "Punjab",
    option4: "California",
    answer: "AC"
  },
  {
    question: "Find the mammals from the list",
    _type: "MCQ",
    option1: "Lion",
    option2: "Crocodile",
    option3: "Dog",
    option4: "Parrot",
    answer: "AC"
  },
  {
    question: "Which of the following are parts of a plant?",
    _type: "MCQ",
    option1: "Root",
    option2: "Leaf",
    option3: "Stem",
    option4: "Stone",
    answer: "ABC"
  },
  {
    question: "Pick the colors in the Indian flag",
    _type: "MCQ",
    option1: "Orange",
    option2: "Green",
    option3: "Blue",
    option4: "Black",
    answer: "ABC"
  },
  {
    question: "Select all prime numbers",
    _type: "MCQ",
    option1: "7",
    option2: "9",
    option3: "11",
    option4: "12",
    answer: "AC"
  },
  {
    question: "Find vegetables from the following",
    _type: "MCQ",
    option1: "Spinach",
    option2: "Banana",
    option3: "Potato",
    option4: "Mango",
    answer: "AC"
  },
  {
    question: "Choose the basic operations in arithmetic",
    _type: "MCQ",
    option1: "Addition",
    option2: "Division",
    option3: "Multiplication",
    option4: "Exponentiation",
    answer: "ABC"
  },
  // Sampling up to 100 questions, include more similarly...
];

// Generate test data
// const generateMockTests = async () => {
//   try {
//     // Clear existing tests
//     await Test.deleteMany({});

//     // Create sample tests
//     const test1 = new Test({
//       testName: "General Knowledge Quiz",
//       startTime: new Date("2023-06-15T10:00:00Z"),
//       endTime: new Date("2023-06-15T12:00:00Z"),
//       duration: 120, // 2 hours in minutes
//       numberOfQues: 5,
//       totalMarks: 50,
//       questions: sampleQuestions.slice(0, 5) // First 5 questions
//     });

//     const test2 = new Test({
//       testName: "Science and Technology Test",
//       startTime: new Date("2023-06-20T14:00:00Z"),
//       endTime: new Date("2023-06-20T15:30:00Z"),
//       duration: 90, // 1.5 hours in minutes
//       numberOfQues: 7,
//       totalMarks: 70,
//       questions: sampleQuestions // All questions
//     });

//     // Save to database
//     await test1.save();
//     await test2.save();

//     console.log("Mock tests created successfully!");
//     console.log(`Created 2 tests with ${sampleQuestions.length} sample questions`);

//     mongoose.disconnect();
//   } catch (err) {
//     console.error("Error creating mock data:", err);
//     mongoose.disconnect();
//   }
// };

const generateMockTests = async () => {
  try {
    await Question.deleteMany();
    await Question.insertMany(sampleQuestions);
    console.log('Mock questions generated successfully');
  } catch (err) {
    console.error('Error generating mock questions:', err);
  }
};

// Run the generator
generateMockTests();
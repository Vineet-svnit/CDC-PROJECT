const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
        questionImage: {
            type: String,
            default: undefined
        },
        question: String,
        _type: {
            type: String,
            required: true,
            enum: ["SCQ", "MCQ"]
        },
        image1: {
            type: String,
            default: undefined
        },
        option1: String,
        image2: {
            type: String,
            default: undefined
        },
        option2: String,
        image3: {
            type: String,
            default: undefined
        },
        option3: String,
        image4: {
            type: String,
            default: undefined
        },
        option4: String,
        answer: String
});

module.exports = mongoose.model("Question", questionSchema);


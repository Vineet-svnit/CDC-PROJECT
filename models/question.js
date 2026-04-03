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
    answer: String,
    category: String
});

const models = {};

const getQuestionModel = (branch) => {
    // Determine the target collection based on branch identifier
    // Default 'lr' logic is routed to questions collection as earlier default
    const collectionName = branch === 'lr' ? 'questions' : `${branch}_questions`;

    if (!models[collectionName]) {
        // We supply the explicit collection name to mongoose.model as the 3rd argument OR mongoose will pluralize
        models[collectionName] = mongoose.model(collectionName, questionSchema, collectionName);
    }

    return models[collectionName];
};

module.exports = { getQuestionModel, questionSchema };
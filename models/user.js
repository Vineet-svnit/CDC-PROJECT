const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-z][0-9]{2}[a-z]{2,5}[0-9]{3}/i
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-z][0-9]{2}[a-z]{2,5}[0-9]{3}@[a-z]+\.svnit\.ac\.in$/i
    },
    name: {
        type: String,
        required: true
    },
    program: {
        type: String,
        enum: ['btech', 'mtech', 'mba', 'msc'],
        required: true
    },
    branch: {
        type: String,
        enum: ['ai', 'che', 'chm', 'ce', 'cse', 'ee', 'ece', 'hss', 'ms', 'math', 'me', 'phy', ''],
        required: true
    },
    year: {
        type: Number,
        required: true,
        // Stores admission academic year (e.g., 2024)
        // Academic year runs from May 30 to May 30 of next year
    },
    pendingTestId: {
        type: Schema.Types.ObjectId,
        ref: 'Test'
    },
    submissions: [
        {
            test_id: {
                type: Schema.Types.ObjectId,
                ref: "Test"
            },
            // questions: [{
            //     questionImage: {
            //         type: String,
            //         default: undefined
            //     },
            //     question: String,
            //     _type: {
            //         type: String,
            //         required: true,
            //         enum: ["SCQ", "MCQ"]
            //     },
            //     image1: {
            //         type: String,
            //         default: undefined
            //     },
            //     option1: String,
            //     image2: {
            //         type: String,
            //         default: undefined
            //     },
            //     option2: String,
            //     image3: {
            //         type: String,
            //         default: undefined
            //     },
            //     option3: String,
            //     image4: {
            //         type: String,
            //         default: undefined
            //     },
            //     option4: String,
            //     answer: String
            // }],
            submittedAns: [
                {
                    question: {
                        type: Schema.Types.ObjectId,
                        ref: "Question"
                    },
                    answer: {
                        type: String,
                        default: ""
                    },
                    isMarked: {
                        type: Boolean,
                        default: false
                    },
                    score: {
                        type: Number,
                        default: 0
                    }
                }
            ],
            score: {
                type: Number,
                default: 0
            },
            isQualified: {
                type: Boolean,
                default: false
            },
            categoryResults: [{
                category: String,
                score: Number,
                percentage: Number,
                isQualified: Boolean
            }]
        }
    ]
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);

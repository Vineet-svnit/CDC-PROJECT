const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        // unique: true,
        // match: /^[a-z][0-9]{2}[a-z]{2}[0-9]{3}@[a-z]+\.svnit\.ac\.in$/i
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    branch: {
        type: String,
        enum: ['ai', 'che', 'chm', 'ce', 'cse', 'ee', 'ece', 'hss', 'ms', 'math', 'me', 'phy'],
        required: true
    },
    year: {
        type: String,
        required: true
    },
    submissions: [
        {
            test_id:{
                type:Schema.Types.ObjectId,
                ref:"Test"
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
            }
        }
    ]
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);

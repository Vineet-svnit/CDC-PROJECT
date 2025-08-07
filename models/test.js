const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testSchema = new Schema({
    testName: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number,
        required: true,
        min: 0,
    },
    numberOfQues: {
        type: Number,
        required: true,
        min: 1
    },
    totalMarks: {
        type: Number,
        min: 0
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Question"
        }
    ]
});

module.exports = mongoose.model("Test", testSchema);

// const mongoose=require("mongoose");
// const Schema=mongoose.Schema;

// const testSchema=new Schema({
//     testName:{
//         type:String,
//         required:true
//     },
//     startTime:{
//         type:Date,
//         required:true
//     },
//     endTime:{
//         type:Date
//     },
//     duration:{
//         type:Number,
//         required:true,
//         min:0,
//     },
//     numberOfQues:{
//         type:Number,
//         required:true,
//         min:1
//     },
//     totalMarks:{
//         type:Number,
//         min:0
//     },
//     questions:[
//         {   _id:false,
//             questionImage:{
//                 type:String,
//                 default:undefined
//             },
//             question:String,
//             _type:{
//                 type:String,
//                 required:true,
//                 enum:["SCQ","MCQ"]
//             },
//             image1:{
//                 type:String,
//                 default:undefined
//             },
//             option1:String,
//             image2:{
//                 type:String,
//                 default:undefined
//             },
//             option2:String,
//             image3:{
//                 type:String,
//                 default:undefined
//             },
//             option3:String,
//             image4:{
//                 type:String,
//                 default:undefined
//             },
//             option4:String,
//             answer:String
//         }
//     ]
// });

// module.exports=mongoose.model("Test",testSchema);


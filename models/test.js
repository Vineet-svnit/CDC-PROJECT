const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const branchToModel = {
    lr: 'Question', // assuming LogicalReasoning uses Question model
    ai: 'AiDepartment',
    che: 'ChemicalDepartment',
    chm: 'ChemistryDepartment',
    ce: 'CivilDepartment',
    cse: 'ComputerScienceDepartment',
    ee: 'ElectricalDepartment',
    ece: 'ElectronicsCommunicationDepartment',
    hss: 'HumanitiesSocialSciencesDepartment',
    ms: 'ManagementStudiesDepartment',
    math: 'MathematicsDepartment',
    me: 'MechanicalDepartment',
    phy: 'PhysicsDepartment'
};

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
    category: [{
        category_name: String,
        numberOfQues: Number
    }],
    totalMarks: {
        type: Number,
        min: 0
    },
    branchModel: {
        type: String,
        required: true,
        enum: Object.values(branchToModel)
    },
    questions: [{
        type: Schema.Types.ObjectId,
        refPath: 'branchModel'
    }],
    branch: {
        type: String,
        enum: ['ai', 'che', 'chm', 'ce', 'cse', 'ee', 'ece', 'hss', 'ms', 'math', 'me', 'phy', 'lr'],
        required: true
    }
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


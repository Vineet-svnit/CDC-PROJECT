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
    category: [{
        category_name: String,
        numberOfQues: Number,
        cutoffPercentage: {
            type: Number,
            default: 0
        }
    }],
    isTechnical: {
        type: Boolean,
        default: false
    },
    totalMarks: {
        type: Number,
        min: 0
    },
    totalCutoffPercentage: {
        type: Number,
        default: 0
    },
    branchModel: {
        type: String,
        required: true
    },
    questions: [{
        type: Schema.Types.ObjectId,
        refPath: 'branchModel'
    }],
    branch: {
        type: String,
        enum: [
            'b_ai', 'b_ch', 'b_ce', 'b_cse', 'b_ep', 'b_ee', 'b_ece', 'b_vlsi', 'b_ic', 'b_mnc', 'b_me',
            'm_cad_cam', 'm_ch', 'm_comm_sys', 'm_cse', 'm_control_auto', 'm_ctm', 'm_ds', 'm_env', 'm_geo',
            'm_is', 'm_inst_ctrl', 'm_manufacturing', 'm_me', 'm_peed', 'm_power_sys', 'm_struct', 'm_thermal', 
            'm_transport', 'm_turbo', 'm_urban', 'm_vlsi', 'm_water',
            'msc_math', 'msc_phy', 'msc_chem',
            'mba_ba'
        ],
        required: true
    },
    program: {
        type: String,
        required: true
    },
    year: {
        type: Number,
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


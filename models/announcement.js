const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const  announcemmentSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    date:{
        type: String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    issued_by:{
        type:String,
        required:true
    },
    // Target audience filters
    program: {
        type: String,
        enum: ['all', 'btech', 'mtech', 'mba', 'msc'],
        default: 'all'
    },
    branch: {
        type: String,
        enum: ['all', 'ai', 'che', 'chm', 'ce', 'cse', 'ee', 'ece', 'hss', 'ms', 'math', 'me', 'phy', ''],
        default: 'all'
    },
    year: {
        type: Number,
        default: null  // null means all years
    }
});

module.exports=mongoose.model("Announcement",announcemmentSchema);
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
    }
});

module.exports=mongoose.model("Announcement",announcemmentSchema);
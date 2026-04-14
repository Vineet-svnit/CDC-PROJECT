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
        enum: [
            'all',
            'b_ai', 'b_ch', 'b_ce', 'b_cse', 'b_ep', 'b_ee', 'b_ece', 'b_vlsi', 'b_ic', 'b_mnc', 'b_me',
            'm_cad_cam', 'm_ch', 'm_comm_sys', 'm_cse', 'm_control_auto', 'm_ctm', 'm_ds', 'm_env', 'm_geo',
            'm_is', 'm_inst_ctrl', 'm_manufacturing', 'm_me', 'm_peed', 'm_power_sys', 'm_struct', 'm_thermal', 
            'm_transport', 'm_turbo', 'm_urban', 'm_vlsi', 'm_water',
            'msc_math', 'msc_phy', 'msc_chem',
            'mba_ba', ''
        ],
        default: 'all'
    },
    year: {
        type: Number,
        default: null  // null means all years
    }
});

module.exports=mongoose.model("Announcement",announcemmentSchema);
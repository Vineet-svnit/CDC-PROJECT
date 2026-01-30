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

module.exports = {
    Question:mongoose.model("Question", questionSchema),
    AiDepartment: mongoose.model("AiDepartment", questionSchema),
    ChemicalDepartment: mongoose.model("ChemicalDepartment", questionSchema),
    ChemistryDepartment: mongoose.model("ChemistryDepartment", questionSchema),
    CivilDepartment: mongoose.model("CivilDepartment", questionSchema),
    ComputerScienceDepartment: mongoose.model("ComputerScienceDepartment", questionSchema),
    ElectricalDepartment: mongoose.model("ElectricalDepartment", questionSchema),
    ElectronicsCommunicationDepartment: mongoose.model("ElectronicsCommunicationDepartment", questionSchema),
    HumanitiesSocialSciencesDepartment: mongoose.model("HumanitiesSocialSciencesDepartment", questionSchema),
    ManagementStudiesDepartment: mongoose.model("ManagementStudiesDepartment", questionSchema),
    MathematicsDepartment: mongoose.model("MathematicsDepartment", questionSchema),
    MechanicalDepartment: mongoose.model("MechanicalDepartment", questionSchema),
    PhysicsDepartment: mongoose.model("PhysicsDepartment", questionSchema)
};
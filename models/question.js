const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { programOptions } = require('../public/js/constants.js');

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

function initModel(modelName, collectionName) {
    if (!mongoose.models[modelName]) {
        models[modelName] = mongoose.model(modelName, questionSchema, collectionName);
    } else {
        models[modelName] = mongoose.models[modelName];
    }
}

// Eager initialization for explicit Mongoose population checks
initModel('questions', 'questions');
// initModel('Question', 'questions'); // Legacy compatibility

// Eager legacy models mapping to avoid populate crashes on older existing tests
// const legacyModels = {
//     'AiDepartment': 'aidepartments',
//     'ChemicalDepartment': 'chemicaldepartments',
//     'ChemistryDepartment': 'chemistrydepartments',
//     'CivilDepartment': 'civildepartments',
//     'ComputerScienceDepartment': 'computersciencedepartments',
//     'ElectricalDepartment': 'electricaldepartments',
//     'ElectronicsCommunicationDepartment': 'electronicscommunicationdepartments',
//     'HumanitiesSocialSciencesDepartment': 'humanitiessocialsciencesdepartments',
//     'ManagementStudiesDepartment': 'managementstudiesdepartments',
//     'MathematicsDepartment': 'mathematicsdepartments',
//     'MechanicalDepartment': 'mechanicaldepartments',
//     'PhysicsDepartment': 'physicsdepartments'
// };

// for (const [modelName, collName] of Object.entries(legacyModels)) {
//     initModel(modelName, collName);
// }

// Eager initialization for all current defined branches
for (const program in programOptions) {
    for (const option of programOptions[program]) {
        if (option.value) { // skip empty
            const collName = `${option.value}_questions`;
            initModel(collName, collName);
        }
    }
}

const getQuestionModel = (branch) => {
    // Determine the target collection based on branch identifier
    const collectionName = branch === 'lr' ? 'questions' : `${branch}_questions`;
    return models[collectionName] || models['questions'];
};

module.exports = { getQuestionModel, questionSchema };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    admission_number: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-z][0-9]{2}[a-z]{2}[0-9]{3}$/i
    },
    institute_email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-z][0-9]{2}[a-z]{2}[0-9]{3}@[a-z]+\.svnit\.ac\.in$/i
    },
    full_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },   
    branch: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        match: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/
    }    
}, { timestamps: true });

module.exports = mongoose.model('User', User);

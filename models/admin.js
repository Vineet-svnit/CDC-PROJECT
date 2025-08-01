const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    adminUserName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

adminSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('Admin', adminSchema);
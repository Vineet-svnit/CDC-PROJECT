const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');

mongoose.connect('mongodb://127.0.0.1:27017/CDCproject');

async function createAdmin() {
  const hash = await bcrypt.hash('Password@1234', 12);
  const admin = new Admin({ adminUserName: 'admin1', password: hash });
  await admin.save();
  console.log('Admin created');
  mongoose.disconnect();
}

createAdmin();

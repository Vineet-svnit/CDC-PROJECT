const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');

mongoose.connect(process.env.MONGODB_URI);

async function createAdmin() {
  const hash = await bcrypt.hash('pass', 12);
  const admin = new Admin({ adminUserName: 'admin1', password: hash });
  await admin.save();
  console.log('Admin created');
  mongoose.disconnect();
}

createAdmin();

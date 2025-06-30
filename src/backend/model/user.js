const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  number: String,
  email: { type: String , unique:true},
  password: String,
  image: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

});
  

module.exports = mongoose.model('User', UserSchema);

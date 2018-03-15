const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  googleID: String
});

mongoose.model('users', userSchema); // create 'users' collection 
                                     // if there isn't one already
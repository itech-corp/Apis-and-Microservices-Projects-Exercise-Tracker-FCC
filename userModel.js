const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: String
});

const ExerciseSchema = new Schema({
  userId: {type:String, required:true},
  description: {type:String, required:true},
  duration: {type:Number, required:true},
  data: {type:Date, required:true}
});

const userModel = mongoose.model('UserModel',UserSchema);
const exerciseModel = mongoose.model('exerciseModel',ExerciseSchema);

module.exports = userModel,exerciseModel; 
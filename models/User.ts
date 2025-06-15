import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },  // <-- required field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  age: Number,
  gender: String,
  address: String,
  // other fields if needed
});

// This line prevents OverwriteModelError by reusing the existing model if it exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

const mongoose = require('mongoose');  // Import the mongoose library for working with MongoDB

// Define the schema for a User in the database
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,      // The full name of the user is a string
    required: true     // This field is required, meaning it cannot be empty
  },
  idNumber: {
    type: String,      
    required: true     
  },
  accountNumber: {
    type: String,      
    required: true     
  },
  password: {
    type: String,     
    required: true    
  }
});

// Export the model, allowing it to be used elsewhere in the application
module.exports = mongoose.model('User', userSchema);

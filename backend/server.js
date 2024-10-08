// Import necessary modules
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const fs = require('fs');
const https = require('https');
const { JSDOM } = require('jsdom');  // Use JSDOM for DOMPurify
const DOMPurify = require('dompurify')(new JSDOM().window);
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const User = require('./models/User');  // Assuming you have a User model

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Add security headers using Helmet
app.use(helmet());

// Set up cookie parser middleware (required for CSRF)
app.use(cookieParser());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Setup CSRF protection (cookie-based)
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection middleware for routes that require mutating data (POST/PUT/DELETE)
app.use(csrfProtection);

// RegEx Patterns for input validation
const usernamePattern = /^[a-zA-Z0-9]{3,20}$/;  // Alphanumeric, 3-20 characters
const idNumberPattern = /^\d{8,12}$/;           // 8-12 digit ID Number
const accountNumberPattern = /^\d{10,12}$/;     // 10-12 digit account number

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/customer-portal';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rate limiting to prevent brute force attacks on login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,  // limit each IP to 5 requests per windowMs
});

// Secure HTTPS server setup
const privateKey = fs.readFileSync('C:\\Users\\lab_services_student\\bank-customer-portal\\backend\\Keys\\privatekey.pem', 'utf8');
const certificate = fs.readFileSync('C:\\Users\\lab_services_student\\bank-customer-portal\\backend\\Keys\\certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Register Route with input validation, password hashing, and XSS protection
app.post('/register', async (req, res) => {
  const { fullName, idNumber, accountNumber, password } = req.body;

  // Validate input fields using RegEx
  if (!usernamePattern.test(fullName)) {
    return res.status(400).json({ message: 'Invalid full name format.' });
  }

  if (!idNumberPattern.test(idNumber)) {
    return res.status(400).json({ message: 'Invalid ID number format.' });
  }

  if (!accountNumberPattern.test(accountNumber)) {
    return res.status(400).json({ message: 'Invalid account number format.' });
  }

  // Hash the password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Sanitize user input to prevent XSS attacks
  const safeFullName = DOMPurify.sanitize(fullName);
  const safeIdNumber = DOMPurify.sanitize(idNumber);
  const safeAccountNumber = DOMPurify.sanitize(accountNumber);

  // Create a new User object
  const newUser = new User({
    fullName: safeFullName,
    idNumber: safeIdNumber,
    accountNumber: safeAccountNumber,
    password: hashedPassword,  // Store the hashed password
  });

  try {
    // Save the user to the database
    await newUser.save();
    console.log(`User registered successfully: 
      Full Name: ${safeFullName}, 
      ID Number: ${safeIdNumber}, 
      Account Number: ${safeAccountNumber}, 
      Hashed Password: ${hashedPassword}`);  // Output the hashed password

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error registering user.' });
  }
});

// Login Route with rate limiting to prevent brute force attacks
app.post('/login', loginLimiter, async (req, res) => {
  const { accountNumber, password } = req.body;

  try {
    // Find user by account number
    const user = await User.findOne({ accountNumber });

    // Check if user exists and validate password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Successful login logic (e.g., creating a session or JWT token)
    res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

// Route to get CSRF token for frontend use
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Start both HTTP and HTTPS servers
const PORT = process.env.PORT || 5000;

// HTTP server
app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

// HTTPS server
https.createServer(credentials, app).listen(5001, () => {
  console.log('Secure HTTPS server running on port 5001');
});

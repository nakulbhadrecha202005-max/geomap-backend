const User = require('./model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser')

const signupController = async (req, res) => {
  try {
    // Validate input
    const { username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res, next) => {
    try {
        console.log("Login is running.")
        const {  email, password } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        console.log(existingUser)
        const error_message = "Authentication Failed.";

        if (!existingUser) return res.status(403).json({ message: error_message });
        
        const hashed = await bcrypt.compare(password, existingUser.password);
        if (!hashed) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        const jwtToken = jwt.sign({email: existingUser.email, _id: existingUser._id},"Rakshapath")
        res.cookie('token', jwtToken, {
            httpOnly: true, // Safeguards against XSS
            secure: false // Set to true if using HTTPS in production
        });
        console.log(`User ${existingUser.name} successfully verified. Redirecting to map.`);
        return res.redirect('/Home');
        // if (existingUser) {
        //     return res.status(200).json({jwtToken,existingUser, message: 'Login success successfully!' });
        //     next();   
        // }   

    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
}

module.exports = {signupController , login};
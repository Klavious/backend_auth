const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { UAParser } = require('ua-parser-js');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB URI - ensure this is valid and user has read/write access
const MONGO_URI = 'mongodb+srv://tarundigavalli:mAvhKUCrLVk5fpxX@cluster0.cotbce2.mongodb.net/auth_db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define Mongoose User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true }
});
const User = mongoose.model('User', userSchema);

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { username, password, age } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const newUser = new User({ username, password, age });
    await newUser.save();

    console.log(`👤 New User Registered: ${username}, Age: ${age}`);
    res.json({ message: 'Signup successful! Please login.' });
  } catch (err) {
    console.error('❌ Signup Error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { username, password, userAgent } = req.body;
  const userIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'Unknown IP';

  console.log('\n🔑 Login Attempt');
  console.log('Username:', username);
  console.log('Password Attempt:', password);

  let ipInfo = {};
  try {
    const response = await axios.get(`https://ipapi.co/${userIp}/json/`);
    ipInfo = response.data;
  } catch (err) {
    console.log('Failed to fetch IP info:', err.message);
  }

  const browserInfo = parseUserAgent(userAgent);
  console.log('IP Address:', userIp);
  console.log(`City: ${ipInfo.city || 'Unknown'}, Country: ${ipInfo.country || 'Unknown'}, ISP: ${ipInfo.org || 'Unknown'}`);
  console.log('Browser:', browserInfo);
  console.log('Login Time:', new Date().toISOString());

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful!' });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

function parseUserAgent(uaString) {
  if (!uaString) return 'Unknown';
  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return `${browser.name || 'Unknown'} ${browser.version || ''} on ${os.name || 'Unknown'} ${os.version || ''}`;
}

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

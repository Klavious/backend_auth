const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');

app.use(cors());
app.use(express.json());

// Simple in-memory user storage
const users = {};

// Get real IP from request
function getIP(req) {
  return req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;
}

// Get IP details from external API
async function getIPDetails(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching IP details:', error.message);
    return null;
  }
}

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const ip = getIP(req);

  const ipDetails = await getIPDetails(ip);

  console.log(`[SIGNUP] Username: ${username} | Password: ${password} | IP: ${ip} | Location: ${ipDetails?.city}, ${ipDetails?.country_name} | ISP: ${ipDetails?.org}`);

  if (users[username]) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users[username] = password;
  res.json({ message: 'Signup successful!' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = getIP(req);

  const ipDetails = await getIPDetails(ip);

  console.log(`[LOGIN] Username: ${username} | Password Attempt: ${password} | IP: ${ip} | Location: ${ipDetails?.city}, ${ipDetails?.country_name} | ISP: ${ipDetails?.org}`);

  if (users[username] && users[username] === password) {
    res.json({ message: 'Login successful!' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

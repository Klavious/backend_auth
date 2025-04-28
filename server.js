const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage
const users = {};

app.use(cors());
app.use(bodyParser.json());

// Helper to get IP info
async function getIPInfo(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching IP info:', error.message);
    return null;
  }
}

app.post('/signup', async (req, res) => {
  const { username, password, userAgent } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const ipInfo = await getIPInfo(ip);

  console.log(`\n📥 New Signup`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log(`IP Address: ${ip}`);
  if (ipInfo) {
    console.log(`City: ${ipInfo.city}, Country: ${ipInfo.country}, ISP: ${ipInfo.org}`);
  }
  console.log(`Browser Info: ${userAgent}`);
  console.log(`Signup Time: ${new Date().toISOString()}`);

  users[username] = { password };

  res.json({ message: 'Signup successful. Please login.' });
});

app.post('/login', async (req, res) => {
  const { username, password, userAgent } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const ipInfo = await getIPInfo(ip);

  console.log(`\n🔑 Login Attempt`);
  console.log(`Username: ${username}`);
  console.log(`Password Attempt: ${password}`);
  console.log(`IP Address: ${ip}`);
  if (ipInfo) {
    console.log(`City: ${ipInfo.city}, Country: ${ipInfo.country}, ISP: ${ipInfo.org}`);
  }
  console.log(`Browser Info: ${userAgent}`);
  console.log(`Login Time: ${new Date().toISOString()}`);

  if (users[username] && users[username].password === password) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Home route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

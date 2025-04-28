const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { UAParser } = require('ua-parser-js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const users = {};  // In-memory user storage

app.post('/signup', (req, res) => {
  const { username, password, age } = req.body;

  if (users[username]) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  users[username] = { password, age };
  console.log(`👤 New User Registered: ${username}, Age: ${age}`);
  res.json({ message: 'Signup successful! Please login.' });
});

app.post('/login', async (req, res) => {
  const { username, password, userAgent } = req.body;
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';

  console.log('\n🔑 Login Attempt');
  console.log('Username:', username);
  console.log('Password Attempt:', password);

  let ipInfo = {};
  try {
    const ip = userIp.split(',')[0].trim();
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    ipInfo = response.data;
  } catch (err) {
    console.log('Failed to fetch IP info:', err.message);
  }

  console.log('IP Address:', userIp.split(',')[0]);
  console.log(`City: ${ipInfo.city || 'Unknown'}, Country: ${ipInfo.country || 'Unknown'}, ISP: ${ipInfo.org || 'Unknown'}`);

  const browserInfo = parseUserAgent(userAgent);
  console.log('Browser:', browserInfo);

  console.log('Login Time:', new Date().toISOString());

  if (!users[username]) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  if (users[username].password !== password) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful!' });
});

function parseUserAgent(uaString) {
  if (!uaString) return 'Unknown';

  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return `${browser.name || 'Unknown'} ${browser.version || ''} on ${os.name || 'Unknown'} ${os.version || ''}`;
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

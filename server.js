const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple in-memory user storage
const users = [];

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  return res.json({ message: 'Signup successful!' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log(`🔑 Login attempt - Username: ${username}, Password: ${password}`);
  
  // your normal login logic here
});

  
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return res.json({ message: 'Login successful!' });
  } else {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

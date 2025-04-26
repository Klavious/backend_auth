const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let users = [];

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  users.push({ username, password });
  console.log(`✅ New signup - Username: ${username}, Password: ${password}`);
  
  res.json({ message: 'Signup successful' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log(`🔑 Login attempt - Username: ${username}, Password: ${password}`);
  
  const user = users.find(user => user.username === username && user.password === password);
  
  if (user) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

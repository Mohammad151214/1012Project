const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Middleware
app.use(express.json());

// Helper function to read data from file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to write data to file
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await readData();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// GET single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const users = await readData();
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// POST create new user
app.post('/api/users', async (req, res) => {
  try {
    const users = await readData();
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name,
      email,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeData(users);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const users = await readData();
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, email } = req.body;
    
    users[index] = {
      ...users[index],
      name: name || users[index].name,
      email: email || users[index].email,
      updatedAt: new Date().toISOString()
    };
    
    await writeData(users);
    res.json(users[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const users = await readData();
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users.splice(index, 1)[0];
    await writeData(users);
    
    res.json({ message: 'User deleted', user: deletedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const users = await readData();
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Login successful', 
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const users = await readData();
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeData(users);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'Signup successful', 
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
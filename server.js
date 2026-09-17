const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { pool, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'timetracking-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Helper function to format date/time
function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Helper function to validate and trim required text fields
function validateRequiredFields(fields, fieldNames) {
  for (let i = 0; i < fields.length; i++) {
    if (!fields[i]?.trim()) {
      return { valid: false, error: `${fieldNames[i]} ist erforderlich` };
    }
  }
  return { valid: true };
}

// Helper function to calculate start and end times
function calculateTimes(durationMinutes) {
  const now = new Date();
  const endTime = new Date(now);
  const startTime = new Date(now.getTime() - (durationMinutes * 60 * 1000));
  
  return {
    startTime: formatDateTime(startTime),
    endTime: formatDateTime(endTime)
  };
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Registration routes
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.render('register', { error: 'Benutzername und Passwort sind erforderlich' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)', 
      [username, hashedPassword]
    );
    
    res.redirect('/login');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.render('register', { error: 'Benutzername existiert bereits' });
    }
    console.error('Registration error:', error);
    res.render('register', { error: 'Registrierung fehlgeschlagen' });
  }
});

// Login routes
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];
    
    if (!user) {
      return res.render('login', { error: 'Ungültiger Benutzername oder Passwort' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Ungültiger Benutzername oder Passwort' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Ungültiger Benutzername oder Passwort' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.redirect('/login');
  });
});

// Dashboard route
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { username: req.session.username });
});

// All entries route
app.get('/all-entries', requireAuth, (req, res) => {
  res.render('allentries', { username: req.session.username });
});

// API endpoint to get all entries
app.get('/api/all-entries', requireAuth, async (req, res) => {
  try {
    const [entries] = await pool.query(
      `SELECT * FROM tasks 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [req.session.userId]
    );
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Einträge konnten nicht geladen werden' });
  }
});

// Add task route
app.post('/add-task', requireAuth, async (req, res) => {
  const { taskName, customerName, description, hours, minutes } = req.body;
  const durationHours = parseInt(hours) || 0;
  const durationMinutes = parseInt(minutes) || 0;
  const totalMinutes = (durationHours * 60) + durationMinutes;
  
  const validation = validateRequiredFields(
    [taskName, customerName], 
    ['Aufgabenname', 'Kundenname']
  );
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  if (totalMinutes <= 0) {
    return res.status(400).json({ error: 'Dauer muss größer als 0 sein' });
  }
  
  const trimmedTaskName = taskName.trim();
  const trimmedCustomerName = customerName.trim();
  const trimmedDescription = (description || '').trim();
  const times = calculateTimes(totalMinutes);
  
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, task_name, customer_name, description, duration, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.session.userId, trimmedTaskName, trimmedCustomerName, trimmedDescription, totalMinutes, times.startTime, times.endTime]
    );
    
    res.json({ 
      success: true, 
      task: {
        id: result.insertId,
        taskName: trimmedTaskName,
        customerName: trimmedCustomerName,
        description: trimmedDescription,
        duration: totalMinutes,
        startTime: times.startTime,
        endTime: times.endTime
      }
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Aufgabe konnte nicht gespeichert werden' });
  }
});

// Feierabend route - get all tasks from today
app.get('/feierabend', requireAuth, async (req, res) => {
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
  
  try {
    const [tasks] = await pool.query(
      `SELECT * FROM tasks 
       WHERE user_id = ? AND start_time LIKE ? 
       ORDER BY start_time DESC`,
      [req.session.userId, `${todayStr}%`]
    );
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Aufgaben konnten nicht geladen werden' });
  }
});

// ToDo API endpoints
app.get('/api/todos', requireAuth, async (req, res) => {
  try {
    const [todos] = await pool.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'ToDos konnten nicht geladen werden' });
  }
});

app.post('/api/todos', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Titel ist erforderlich' });
  }
  
  const trimmedTitle = title.trim();
  const trimmedDescription = (description || '').trim();
  
  try {
    const [result] = await pool.query(
      'INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)',
      [req.session.userId, trimmedTitle, trimmedDescription]
    );
    
    res.json({ 
      success: true, 
      todo: {
        id: result.insertId,
        title: trimmedTitle,
        description: trimmedDescription,
        done: 0
      }
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'ToDo konnte nicht gespeichert werden' });
  }
});

app.put('/api/todos/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  
  try {
    const [result] = await pool.query(
      'UPDATE todos SET done = ? WHERE id = ? AND user_id = ?',
      [done ? 1 : 0, id, req.session.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ToDo nicht gefunden' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'ToDo konnte nicht aktualisiert werden' });
  }
});

app.delete('/api/todos/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [id, req.session.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ToDo nicht gefunden' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'ToDo konnte nicht gelöscht werden' });
  }
});

// Update task endpoint
app.put('/api/tasks/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { taskName, customerName, description, hours, minutes } = req.body;
  const durationHours = parseInt(hours) || 0;
  const durationMinutes = parseInt(minutes) || 0;
  const totalMinutes = (durationHours * 60) + durationMinutes;
  
  const validation = validateRequiredFields(
    [taskName, customerName], 
    ['Aufgabenname', 'Kundenname']
  );
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  if (totalMinutes <= 0) {
    return res.status(400).json({ error: 'Dauer muss größer als 0 sein' });
  }
  
  const trimmedTaskName = taskName.trim();
  const trimmedCustomerName = customerName.trim();
  const trimmedDescription = (description || '').trim();
  const times = calculateTimes(totalMinutes);
  
  try {
    const [result] = await pool.query(
      'UPDATE tasks SET task_name = ?, customer_name = ?, description = ?, duration = ?, start_time = ?, end_time = ? WHERE id = ? AND user_id = ?',
      [trimmedTaskName, trimmedCustomerName, trimmedDescription, totalMinutes, times.startTime, times.endTime, id, req.session.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }
    
    res.json({ 
      success: true,
      task: {
        id,
        taskName: trimmedTaskName,
        customerName: trimmedCustomerName,
        description: trimmedDescription,
        duration: totalMinutes,
        startTime: times.startTime,
        endTime: times.endTime
      }
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Aufgabe konnte nicht aktualisiert werden' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Time Tracking App running on http://localhost:${PORT}`);
});

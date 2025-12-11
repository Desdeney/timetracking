const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./timetracking.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: 'timetracking-secret-key-change-in-production',
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
    return res.render('register', { error: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
      [username, hashedPassword], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.render('register', { error: 'Username already exists' });
          }
          return res.render('register', { error: 'Registration failed' });
        }
        res.redirect('/login');
      }
    );
  } catch (error) {
    res.render('register', { error: 'Registration failed' });
  }
});

// Login routes
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Dashboard route
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { username: req.session.username });
});

// Add task route
app.post('/add-task', requireAuth, (req, res) => {
  const { taskName, description, duration } = req.body;
  const durationMinutes = parseInt(duration);
  
  if (!taskName || !duration || isNaN(durationMinutes) || durationMinutes <= 0) {
    return res.status(400).json({ error: 'Invalid task data' });
  }
  
  const times = calculateTimes(durationMinutes);
  
  db.run(
    'INSERT INTO tasks (user_id, task_name, description, duration, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
    [req.session.userId, taskName, description || '', durationMinutes, times.startTime, times.endTime],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save task' });
      }
      res.json({ 
        success: true, 
        task: {
          id: this.lastID,
          taskName,
          description,
          duration: durationMinutes,
          startTime: times.startTime,
          endTime: times.endTime
        }
      });
    }
  );
});

// Feierabend route - get all tasks from today
app.get('/feierabend', requireAuth, (req, res) => {
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
  
  db.all(
    `SELECT * FROM tasks 
     WHERE user_id = ? AND start_time LIKE ? 
     ORDER BY start_time DESC`,
    [req.session.userId, `${todayStr}%`],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      res.json({ tasks });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Time Tracking App running on http://localhost:${PORT}`);
});

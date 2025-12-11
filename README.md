# Time Tracking App

A Node.js web application for tracking work time with user authentication and task management.

## Features

- ✅ User registration and login system
- ✅ Secure password hashing with bcrypt
- ✅ Track time by entering duration (in minutes), task name, and description
- ✅ Automatic calculation of start and end times in format `dd.mm.YYYY hh:mm`
- ✅ SQLite database for persistent storage
- ✅ "Feierabend" button to display all tasks from the current day
- ✅ Task summary with total time worked
- ✅ Session-based authentication

## Requirements

- Node.js (v14 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Desdeney/timetracking.git
cd timetracking
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the application:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Register a new account or login with existing credentials

4. Track your time:
   - Enter the task name
   - Add an optional description
   - Specify the duration in minutes
   - Click "Add Task" to save

5. Click the "Feierabend" button to view all tasks from today with:
   - Task names and descriptions
   - Duration in minutes
   - Start and end times
   - Total time worked

## Project Structure

```
timetracking/
├── server.js           # Main server file with Express routes
├── views/              # EJS templates
│   ├── login.ejs      # Login page
│   ├── register.ejs   # Registration page
│   └── dashboard.ejs  # Main dashboard
├── package.json        # Project dependencies
└── timetracking.db     # SQLite database (auto-generated)
```

## Technologies Used

- **Express** - Web framework
- **SQLite3** - Database
- **EJS** - Templating engine
- **bcrypt** - Password hashing
- **express-session** - Session management

## Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/e7212351-e5a1-4dfc-9af5-93fd5affb52e)

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/d4364095-a9f0-40b7-b3f7-b822e988d287)

### Task Added
![Task Added](https://github.com/user-attachments/assets/61effee5-2e80-40d6-a91d-31d91594ecb9)

### Feierabend - Today's Tasks
![Feierabend Table](https://github.com/user-attachments/assets/686a1e40-4761-492e-bd13-089423cccb64)

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `created_at` - Timestamp

### Tasks Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `task_name` - Name of the task
- `description` - Task description
- `duration` - Duration in minutes
- `start_time` - Calculated start time (dd.mm.YYYY hh:mm)
- `end_time` - Calculated end time (dd.mm.YYYY hh:mm)
- `created_at` - Timestamp

## License

ISC

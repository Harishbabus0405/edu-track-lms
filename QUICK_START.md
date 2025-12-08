# 🚀 Quick Start Guide

## Current Status: ✅ READY TO USE!

Your backend is **already running** on http://127.0.0.1:4000

## How to Use Right Now:

### 1. Open the Website
- Open `index.html` in your browser
- OR use Live Server in VS Code

### 2. Register a New Account
1. Click "Register"
2. Fill in:
   - Name: Your Name
   - Role: Student or Teacher
   - Email: your@email.com
   - Password: at least 6 characters
3. Click Register

### 3. Login
1. Click "Login"
2. Enter your email and password
3. Select the same role you registered with
4. Click Login

### 4. Use the System

**As Student:**
- View available courses
- Enroll in courses
- Complete lessons
- Take quizzes
- View certificates

**As Teacher:**
- Create new courses
- Add lessons
- Create quiz questions
- View enrolled students

**As Admin:**
- Email: `admin@gmail.com`
- Password: `admin123`
- View all users and statistics

## Database Connection

Your MySQL database is set up with:
- Database: `edutrack_lms`
- Host: localhost
- User: root
- Password: 040506

## View Data in MySQL Workbench

1. Open MySQL Workbench
2. Connect to localhost
3. Select `edutrack_lms` database
4. Run queries:
   ```sql
   SELECT * FROM users;
   SELECT * FROM courses;
   SELECT * FROM enrollments;
   SELECT * FROM quiz_results;
   ```

## Stop the Backend

Press `CTRL+C` in the terminal where Flask is running

## Restart the Backend

```bash
cd edutrack-backend
python app.py
```

## That's It! 🎉

Everything is connected and working:
✅ MySQL database created with tables
✅ Flask backend running on port 4000  
✅ Frontend connected to backend
✅ Sample data loaded

**Just open index.html and start using it!**

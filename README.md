# EduTrack LMS - Learning Management System

A full-stack LMS with Python Flask backend and MySQL database.

## 🚀 Features

- **User Authentication** - Register/Login for Students, Teachers, and Admin
- **Course Management** - Teachers can create and manage courses
- **Lesson System** - Add lessons with descriptions and URLs
- **Quiz System** - Create quizzes with multiple-choice questions
- **Progress Tracking** - Track student progress and quiz scores
- **Enrollment System** - Students can enroll in courses
- **Admin Dashboard** - View all users and statistics

## 📋 Prerequisites

- Python 3.x
- MySQL Server (MySQL Workbench recommended)
- Modern web browser

## 🛠️ Installation & Setup

### 1. MySQL Database Setup

1. Open **MySQL Workbench**
2. Create a new connection (if needed):
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: `040506` (or update in `edutrack-backend/app.py`)

3. Run the database schema:
   ```bash
   cd edutrack-backend
   python setup_db.py
   ```

   Or manually execute `schema.sql` in MySQL Workbench

### 2. Install Python Dependencies

```bash
cd edutrack-backend
pip install flask flask-cors mysql-connector-python bcrypt
```

### 3. Start the Backend Server

```bash
cd edutrack-backend
python app.py
```

The server will start on `http://127.0.0.1:4000`

### 4. Open the Frontend

Simply open `index.html` in your web browser or use Live Server in VS Code.

## 📊 Database Schema

The system uses the following tables:
- `users` - User accounts (students, teachers)
- `courses` - Course information
- `lessons` - Course lessons
- `quiz_questions` - Quiz questions per course
- `enrollments` - Student course enrollments
- `lesson_completions` - Lesson completion tracking
- `quiz_results` - Quiz scores
- `course_progress` - Overall course progress

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@gmail.com`
- Password: `admin123`
- Role: Admin

**Sample Data:**
- 3 sample courses are pre-loaded
- Sample lessons and quiz questions included

## 🎯 Usage

### For Students:
1. Register with Student role
2. Browse available courses
3. Enroll in courses
4. Complete lessons
5. Take quizzes
6. View certificates

### For Teachers:
1. Register with Teacher role
2. Create new courses
3. Add lessons to courses
4. Create quiz questions
5. View enrolled students
6. Track student progress

### For Admin:
1. Login with admin credentials
2. View all registered users
3. See platform statistics

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (admin)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/<id>` - Get course details
- `POST /api/courses` - Create new course
- `DELETE /api/courses/<id>` - Delete course

### Lessons
- `POST /api/lessons` - Create lesson
- `DELETE /api/lessons/<id>` - Delete lesson

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/<email>` - Get user enrollments
- `DELETE /api/enrollments` - Unenroll from course

### Progress
- `POST /api/progress` - Update progress
- `GET /api/progress/<email>/<course_id>` - Get progress

### Quiz
- `POST /api/quiz/submit` - Submit quiz
- `GET /api/quiz/result/<email>/<course_id>` - Get quiz result

### Lesson Completions
- `POST /api/lessons/complete` - Mark lesson complete
- `GET /api/lessons/completed/<email>/<course_id>` - Get completed lessons

## 🔧 Configuration

Update MySQL credentials in `edutrack-backend/app.py`:

```python
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "040506"  # Change this
MYSQL_DB = "edutrack_lms"
```

## 📁 Project Structure

```
edu-track-lms/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── edutrack-backend/
│   ├── app.py           # Flask backend
│   ├── schema.sql       # Database schema
│   └── setup_db.py      # Database setup script
├── index.html
├── login.html
├── register.html
├── student-dashboard.html
├── teacher-dashboard.html
├── admin-dashboard.html
├── course-details.html
├── manage-lessons.html
├── manage-quiz.html
├── course-students.html
├── profile.html
└── certificate.html
```

## 🐛 Troubleshooting

**Backend not connecting:**
- Make sure Flask backend is running on port 4000
- Check MySQL server is running
- Verify database credentials in `app.py`

**Database errors:**
- Run `setup_db.py` to recreate tables
- Check MySQL connection in Workbench
- Verify `edutrack_lms` database exists

**Login issues:**
- Make sure you registered first
- Check correct role is selected
- Backend must be running

## 📝 License

This is a demo educational project.

## 👨‍💻 Author

EduTrack LMS - 2025

-- EduTrack LMS Database Schema
-- Run this in MySQL Workbench

CREATE DATABASE IF NOT EXISTS edutrack_lms;
USE edutrack_lms;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    level VARCHAR(50),
    created_by VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE SET NULL
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    option1 VARCHAR(200),
    option2 VARCHAR(200),
    option3 VARCHAR(200),
    option4 VARCHAR(200),
    correct_answer INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_email VARCHAR(120) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_email, course_id)
);

-- Lesson completion tracking
CREATE TABLE IF NOT EXISTS lesson_completions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_email VARCHAR(120) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    lesson_id VARCHAR(50) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_completion (student_email, lesson_id)
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_email VARCHAR(120) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    total INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Course progress table
CREATE TABLE IF NOT EXISTS course_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_email VARCHAR(120) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    progress INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (student_email, course_id)
);

-- Insert sample users (Admin and Teachers)
-- Passwords are hashed with bcrypt
-- All passwords are: 'password123'
INSERT INTO users (name, email, password, role, created_at) VALUES
('Admin User', 'admin@gmail.com', '$2b$12$2y.vcfdipTcYFyPjISGdnOKBXZToUHbYoMZy9/9iUcdGZdPFFwbrq', 'admin', NOW()),
('Teacher One', 'teacher1@gmail.com', '$2b$12$2y.vcfdipTcYFyPjISGdnOKBXZToUHbYoMZy9/9iUcdGZdPFFwbrq', 'teacher', NOW()),
('Teacher Two', 'teacher2@gmail.com', '$2b$12$2y.vcfdipTcYFyPjISGdnOKBXZToUHbYoMZy9/9iUcdGZdPFFwbrq', 'teacher', NOW()),
('Teacher Three', 'teacher3@gmail.com', '$2b$12$2y.vcfdipTcYFyPjISGdnOKBXZToUHbYoMZy9/9iUcdGZdPFFwbrq', 'teacher', NOW()),
('Student Demo', 'student@gmail.com', '$2b$12$2y.vcfdipTcYFyPjISGdnOKBXZToUHbYoMZy9/9iUcdGZdPFFwbrq', 'student', NOW());

-- Insert sample courses
INSERT INTO courses (id, title, description, level, created_by) VALUES
('web-dev', 'Web Development Basics', 'Learn HTML, CSS and basic JavaScript.', 'Beginner', NULL),
('python-beginners', 'Python for Beginners', 'Start your programming journey with Python.', 'Beginner', NULL),
('data-structures', 'Data Structures', 'Learn arrays, stacks, queues & more.', 'Intermediate', NULL);

-- Insert sample lessons
INSERT INTO lessons (id, course_id, title, description, url, position) VALUES
('l_web1', 'web-dev', 'Introduction to Web', 'Overview of web technologies', NULL, 1),
('l_web2', 'web-dev', 'HTML Basics', 'Learn HTML tags and structure', NULL, 2),
('l_web3', 'web-dev', 'CSS Fundamentals', 'Style your web pages', NULL, 3),
('l_web4', 'web-dev', 'Intro to JavaScript', 'Add interactivity to your sites', NULL, 4),
('l_py1', 'python-beginners', 'Getting Started', 'Install Python and setup environment', NULL, 1),
('l_py2', 'python-beginners', 'Variables & Data Types', 'Learn about Python data types', NULL, 2),
('l_py3', 'python-beginners', 'Conditions & Loops', 'Control flow in Python', NULL, 3),
('l_ds1', 'data-structures', 'Arrays', 'Understanding array data structure', NULL, 1),
('l_ds2', 'data-structures', 'Linked List', 'Learn linked list implementation', NULL, 2),
('l_ds3', 'data-structures', 'Stack', 'LIFO data structure', NULL, 3),
('l_ds4', 'data-structures', 'Queue', 'FIFO data structure', NULL, 4);

-- Insert sample quiz questions
INSERT INTO quiz_questions (course_id, question, option1, option2, option3, option4, correct_answer) VALUES
('web-dev', 'Which language is used to structure a web page?', 'CSS', 'JavaScript', 'HTML', 'Python', 2),
('web-dev', 'Which tag is used to create a link in HTML?', '<link>', '<a>', '<href>', '<p>', 1),
('python-beginners', 'Which keyword is used to define a function in Python?', 'func', 'def', 'function', 'lambda', 1),
('python-beginners', 'What is the correct file extension for Python files?', '.pt', '.py', '.js', '.python', 1),
('data-structures', 'Which data structure works on FIFO?', 'Stack', 'Queue', 'Array', 'Tree', 1),
('data-structures', 'Which of these is a linear data structure?', 'Graph', 'Tree', 'Array', 'Hash table', 2);

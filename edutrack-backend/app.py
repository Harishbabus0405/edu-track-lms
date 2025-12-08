import os
import sys
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import json

# Fix Windows Unicode display
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'ignore')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'ignore')

# =============== CONFIG ===============
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "040506"
MYSQL_DB = "edutrack_lms"

# =============== FLASK SETUP ===============
app = Flask(__name__)
CORS(app)

# =============== DB HELPERS ===============
def get_db_connection():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
    )

# =============== ROUTES ===============

@app.get("/")
def home():
    return jsonify({"message": "EduTrack Flask API running", "status": "ok"})

@app.get("/api/ping")
def ping():
    return jsonify({"ok": True, "message": "Ping success"}), 200

# =============== AUTH ROUTES ===============

@app.route("/api/auth/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"message": "All fields required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        # Check duplicate
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"message": "Email already exists"}), 409

        # Hash password
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (name, email, hashed, role),
        )
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "User registered successfully"}), 200

    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({"message": f"Server error: {e}"}), 500

@app.route("/api/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    role_input = (data.get("role") or "").lower()

    if not all([email, password, role_input]):
        return jsonify({"message": "All fields required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()

        if not user:
            cur.close()
            conn.close()
            return jsonify({"message": "Invalid email or password"}), 400

        if (user["role"] or "").lower() != role_input:
            cur.close()
            conn.close()
            return jsonify({"message": "Invalid role selected"}), 400

        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            cur.close()
            conn.close()
            return jsonify({"message": "Invalid email or password"}), 400

        cur.close()
        conn.close()

        return jsonify({
            "message": "Login successful",
            "token": "dummy-token",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"message": f"Server error: {e}"}), 500

# =============== USER ROUTES ===============

@app.get("/api/users")
def get_all_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
        users = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

# =============== COURSE ROUTES ===============

@app.get("/api/courses")
def get_all_courses():
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT c.*, 
                   (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
            FROM courses c
            ORDER BY c.created_at DESC
        """)
        courses = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.get("/api/courses/<course_id>")
def get_course(course_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        
        # Get course details
        cur.execute("SELECT * FROM courses WHERE id = %s", (course_id,))
        course = cur.fetchone()
        
        if not course:
            cur.close()
            conn.close()
            return jsonify({"message": "Course not found"}), 404
        
        # Get lessons
        cur.execute("SELECT * FROM lessons WHERE course_id = %s ORDER BY position", (course_id,))
        course["lessons"] = cur.fetchall()
        
        # Get quiz questions
        cur.execute("SELECT * FROM quiz_questions WHERE course_id = %s", (course_id,))
        quiz = cur.fetchall()
        course["quiz"] = [{
            "question": q["question"],
            "options": [q["option1"], q["option2"], q["option3"], q["option4"]],
            "answerIndex": q["correct_answer"]
        } for q in quiz]
        
        cur.close()
        conn.close()
        return jsonify(course), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.post("/api/courses")
def create_course():
    data = request.get_json() or {}
    course_id = data.get("id")
    title = data.get("title")
    description = data.get("description")
    level = data.get("level")
    created_by = data.get("created_by")

    if not all([course_id, title, created_by]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO courses (id, title, description, level, created_by) VALUES (%s, %s, %s, %s, %s)",
            (course_id, title, description, level, created_by)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Course created successfully", "id": course_id}), 201
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.delete("/api/courses/<course_id>")
def delete_course(course_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM courses WHERE id = %s", (course_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Course deleted"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

# =============== LESSON ROUTES ===============

@app.post("/api/lessons")
def create_lesson():
    data = request.get_json() or {}
    lesson_id = data.get("id")
    course_id = data.get("course_id")
    title = data.get("title")
    description = data.get("description")
    url = data.get("url")
    position = data.get("position", 0)

    if not all([lesson_id, course_id, title]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO lessons (id, course_id, title, description, url, position) VALUES (%s, %s, %s, %s, %s, %s)",
            (lesson_id, course_id, title, description, url, position)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Lesson created"}), 201
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.delete("/api/lessons/<lesson_id>")
def delete_lesson(lesson_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM lessons WHERE id = %s", (lesson_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Lesson deleted"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

# =============== ENROLLMENT ROUTES ===============

@app.post("/api/enrollments")
def create_enrollment():
    data = request.get_json() or {}
    email = data.get("student_email")
    course_id = data.get("course_id")

    if not all([email, course_id]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO enrollments (student_email, course_id) VALUES (%s, %s)",
            (email, course_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Enrolled successfully"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"message": "Already enrolled"}), 409
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.get("/api/enrollments/<email>")
def get_user_enrollments(email):
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT e.*, c.title, c.description, c.level
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_email = %s
        """, (email,))
        enrollments = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(enrollments), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.delete("/api/enrollments")
def delete_enrollment():
    data = request.get_json() or {}
    email = data.get("student_email")
    course_id = data.get("course_id")

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM enrollments WHERE student_email = %s AND course_id = %s",
            (email, course_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Unenrolled"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

# =============== PROGRESS ROUTES ===============

@app.post("/api/progress")
def update_progress():
    data = request.get_json() or {}
    email = data.get("student_email")
    course_id = data.get("course_id")
    progress = data.get("progress", 0)

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO course_progress (student_email, course_id, progress)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE progress = %s
        """, (email, course_id, progress, progress))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Progress updated"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.get("/api/progress/<email>/<course_id>")
def get_progress(email, course_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT progress FROM course_progress WHERE student_email = %s AND course_id = %s",
            (email, course_id)
        )
        result = cur.fetchone()
        cur.close()
        conn.close()
        progress = result["progress"] if result else 0
        return jsonify({"progress": progress}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

# =============== QUIZ ROUTES ===============

@app.post("/api/quiz/submit")
def submit_quiz():
    data = request.get_json() or {}
    email = data.get("student_email")
    course_id = data.get("course_id")
    score = data.get("score")
    total = data.get("total")

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO quiz_results (student_email, course_id, score, total) VALUES (%s, %s, %s, %s)",
            (email, course_id, score, total)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Quiz submitted"}), 201
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.get("/api/quiz/result/<email>/<course_id>")
def get_quiz_result(email, course_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT score, total, submitted_at
            FROM quiz_results
            WHERE student_email = %s AND course_id = %s
            ORDER BY submitted_at DESC
            LIMIT 1
        """, (email, course_id))
        result = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify(result or {}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

# =============== LESSON COMPLETION ROUTES ===============

@app.post("/api/lessons/complete")
def complete_lesson():
    data = request.get_json() or {}
    email = data.get("student_email")
    course_id = data.get("course_id")
    lesson_id = data.get("lesson_id")

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO lesson_completions (student_email, course_id, lesson_id) VALUES (%s, %s, %s)",
            (email, course_id, lesson_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Lesson marked as complete"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"message": "Already completed"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

@app.get("/api/lessons/completed/<email>/<course_id>")
def get_completed_lessons(email, course_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT lesson_id FROM lesson_completions WHERE student_email = %s AND course_id = %s",
            (email, course_id)
        )
        results = cur.fetchall()
        cur.close()
        conn.close()
        lesson_ids = [r["lesson_id"] for r in results]
        return jsonify({"completed_lessons": lesson_ids}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500

if __name__ == "__main__":
    print("Starting EduTrack Flask Backend...")
    print("Database:", MYSQL_DB)
    print("Server: http://127.0.0.1:4000")
    app.run(debug=True, port=4000)

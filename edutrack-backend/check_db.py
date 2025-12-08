import mysql.connector

# Connect to database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='040506',
    database='edutrack_lms'
)

cur = conn.cursor()

# Show all tables
print("\n=== TABLES IN edutrack_lms ===")
cur.execute("SHOW TABLES")
tables = cur.fetchall()
for table in tables:
    print(f"  - {table[0]}")

print(f"\nTotal tables: {len(tables)}")

# Check users table
if tables:
    print("\n=== USERS TABLE ===")
    cur.execute("SELECT id, email, role, name FROM users")
    users = cur.fetchall()
    for user in users:
        print(f"  ID: {user[0]}, Email: {user[1]}, Role: {user[2]}, Name: {user[3]}")
    print(f"Total users: {len(users)}")

    # Check courses table
    print("\n=== COURSES TABLE ===")
    cur.execute("SELECT id, title, created_by FROM courses")
    courses = cur.fetchall()
    for course in courses:
        print(f"  ID: {course[0]}, Title: {course[1]}, Created By: {course[2]}")
    print(f"Total courses: {len(courses)}")

cur.close()
conn.close()

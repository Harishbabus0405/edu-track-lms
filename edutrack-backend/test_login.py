import mysql.connector
import bcrypt

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='040506',
    database='edutrack_lms'
)
cur = conn.cursor(dictionary=True)
cur.execute('SELECT id, name, email, role, password FROM users')
users = cur.fetchall()

print("=== DATABASE USERS ===\n")
for u in users:
    print(f"Email: {u['email']}")
    print(f"Role: {u['role']}")
    print(f"Password Hash: {u['password']}")
    print()

# Test password
print("=== TESTING LOGIN ===\n")
test_password = "password123"
admin_user = users[0]  # Admin is first

print(f"Testing: {admin_user['email']} with password '{test_password}'")
print(f"Hash in DB: {admin_user['password']}")

try:
    result = bcrypt.checkpw(test_password.encode('utf-8'), admin_user['password'].encode('utf-8'))
    print(f"Password match: {result}")
except Exception as e:
    print(f"Error: {e}")

cur.close()
conn.close()

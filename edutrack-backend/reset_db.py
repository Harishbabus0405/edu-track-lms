import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='040506'
)

cur = conn.cursor()

# Drop and recreate database
cur.execute("DROP DATABASE IF EXISTS edutrack_lms")
cur.execute("CREATE DATABASE edutrack_lms")
conn.commit()

print("Database dropped and recreated")
cur.close()
conn.close()

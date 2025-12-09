import bcrypt

# Generate correct hash for 'password123'
password = "password123"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"Correct hash for '{password}':")
print(hashed.decode('utf-8'))

# Verify it works
print(f"\nVerifying hash:")
print(bcrypt.checkpw(password.encode('utf-8'), hashed))

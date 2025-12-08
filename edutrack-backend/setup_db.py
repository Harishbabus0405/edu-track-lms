import mysql.connector
import re

# Connect to MySQL (not to specific database)
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='040506'
)

cur = conn.cursor()

# Read schema file
with open('schema.sql', 'r', encoding='utf-8') as f:
    schema = f.read()

# Remove comments
schema = re.sub(r'--.*$', '', schema, flags=re.MULTILINE)

# Split statements more carefully
statements = []
current_statement = []

for line in schema.split('\n'):
    line = line.strip()
    if not line:
        continue
    
    current_statement.append(line)
    
    # Check if line ends with semicolon
    if line.endswith(';'):
        stmt = ' '.join(current_statement)
        if stmt:
            statements.append(stmt)
        current_statement = []

# Execute each statement
for i, statement in enumerate(statements, 1):
    if statement.strip():
        try:
            cur.execute(statement)
            conn.commit()
            # Show what was executed
            stmt_preview = statement[:80].replace('\n', ' ')
            print(f"[{i}] {stmt_preview}...")
        except Exception as e:
            print(f"[ERROR] Statement {i}: {e}")
            print(f"   {statement[:150]}...")

print(f"\n✅ Database setup complete! Executed {len(statements)} statements.")
cur.close()
conn.close()

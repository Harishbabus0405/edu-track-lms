
import os
import sys
import time
import webbrowser
import subprocess
from pathlib import Path

# Fix Windows Unicode display
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'ignore')

def print_banner():
    print("\n" + "="*60)
    print("   EduTrack LMS - Learning Management System")
    print("="*60)
    print()

def check_requirements():
    """Check if required packages are installed"""
    print("[*] Checking requirements...")
    required = ['flask', 'flask_cors', 'mysql.connector', 'bcrypt']
    missing = []
    
    for package in required:
        try:
            if package == 'mysql.connector':
                __import__('mysql.connector')
            else:
                __import__(package)
            print(f"  [OK] {package}")
        except ImportError:
            missing.append(package)
            print(f"  [!!] {package} - NOT INSTALLED")
    
    if missing:
        print("\n[WARNING] Missing packages detected!")
        print("Run: pip install flask flask-cors mysql-connector-python bcrypt")
        sys.exit(1)
    
    print("[OK] All requirements satisfied!\n")

def check_database():
    """Check if MySQL database is accessible"""
    print("[*] Checking database connection...")
    try:
        import mysql.connector
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="040506",
            database="edutrack_lms"
        )
        conn.close()
        print("[OK] Database connected successfully!\n")
        return True
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        print("\n[INFO] Run this to setup database:")
        print("   cd edutrack-backend")
        print("   python setup_db.py\n")
        return False

def start_backend():
    """Start the Flask backend server"""
    print("[*] Starting Flask Backend Server...")
    backend_path = Path(__file__).parent / "edutrack-backend" / "app.py"
    
    if not backend_path.exists():
        print(f"[ERROR] Backend file not found: {backend_path}")
        sys.exit(1)
    
    # Start backend in a subprocess
    backend_process = subprocess.Popen(
        [sys.executable, str(backend_path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=str(backend_path.parent)
    )
    
    # Wait a bit for server to start
    print("   Waiting for server to start...")
    time.sleep(3)
    
    # Check if process is still running
    if backend_process.poll() is None:
        print("[OK] Backend server started on http://127.0.0.1:4000\n")
        return backend_process
    else:
        print("[ERROR] Backend failed to start!")
        stdout, stderr = backend_process.communicate()
        print("Error:", stderr.decode())
        sys.exit(1)

def open_frontend():
    """Open the frontend in default browser"""
    print("[*] Opening frontend in browser...")
    frontend_path = Path(__file__).parent / "index.html"
    
    if not frontend_path.exists():
        print(f"[ERROR] Frontend file not found: {frontend_path}")
        return False
    
    # Open in browser
    webbrowser.open(f"file://{frontend_path.absolute()}")
    print(f"[OK] Opened: {frontend_path.absolute()}\n")
    return True

def print_instructions():
    """Print usage instructions"""
    print("="*60)
    print("   EduTrack LMS is now running!")
    print("="*60)
    print()
    print("Frontend:  file:///.../index.html (opened in browser)")
    print("Backend:   http://127.0.0.1:4000")
    print("Database:  edutrack_lms @ localhost")
    print()
    print("Default Admin Login:")
    print("   Email:    admin@gmail.com")
    print("   Password: admin123")
    print()
    print("Controls:")
    print("   - Press CTRL+C to stop the server")
    print("   - Refresh browser to reload frontend")
    print()
    print("="*60)
    print()

def main():
    """Main launcher function"""
    print_banner()
    
    # Step 1: Check requirements
    check_requirements()
    
    # Step 2: Check database
    db_ok = check_database()
    if not db_ok:
        print("[*] Auto-setting up database...")
        setup_path = Path(__file__).parent / "edutrack-backend" / "setup_db.py"
        result = subprocess.run(
            [sys.executable, str(setup_path)],
            cwd=str(setup_path.parent),
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("[OK] Database setup completed!\n")
            db_ok = check_database()
        if not db_ok:
            print("[ERROR] Database setup failed!")
            sys.exit(1)
    
    # Step 3: Start backend
    backend_process = start_backend()
    
    # Step 4: Open frontend
    open_frontend()
    
    # Step 5: Print instructions
    print_instructions()
    
    # Step 6: Keep running
    try:
        print("[INFO] Backend server is running... (Press CTRL+C to stop)\n")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n[*] Shutting down...")
        backend_process.terminate()
        backend_process.wait()
        print("[OK] EduTrack LMS stopped successfully!")
        print("Goodbye!\n")

if __name__ == "__main__":
    main()

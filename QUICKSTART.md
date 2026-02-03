# Quick Start Guide - Classroom Management System

## 🚀 Fastest Way: Using Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running
- Git (optional, if cloning)

### Steps:

1. **Open Terminal/Command Prompt**
   - Navigate to the project folder: `cd C:\Users\hanyl\Desktop\classroom`

2. **Start the Application**
   ```bash
   docker-compose up --build
   ```
   This will:
   - Download MongoDB image (first time only)
   - Build the Flask application
   - Start both services

3. **Wait for Startup**
   - You'll see logs showing both services starting
   - Wait until you see: `Running on http://0.0.0.0:5000`

4. **Open Browser**
   - Go to: `http://localhost:5000`

5. **Register Your First Account**
   - Click "Register" tab
   - Fill in:
     - Full Name: Your name
     - Email: your@email.com
     - Password: (choose a password)
     - Role: Select **Teacher**
   - Click "Register"

6. **You're In!** 🎉
   - You'll be redirected to the Teacher Dashboard
   - Start uploading notes, creating tests, etc.

### To Stop the Application:
```bash
# Press Ctrl+C in the terminal, then run:
docker-compose down
```

---

## 📝 Alternative: Local Setup (Without Docker)

### Prerequisites
- Python 3.11 or higher installed
- MongoDB installed and running

### Steps:

1. **Open Terminal/Command Prompt**
   ```bash
   cd C:\Users\hanyl\Desktop\classroom
   ```

2. **Create Virtual Environment (Recommended)**
   ```bash
   python -m venv venv
   ```

3. **Activate Virtual Environment**
   ```bash
   # Windows:
   venv\Scripts\activate
   
   # macOS/Linux:
   source venv/bin/activate
   ```

4. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start MongoDB**
   
   **Windows:**
   - If MongoDB is installed as a service, it should already be running
   - If not, open a new terminal and run: `mongod`
   
   **macOS (Homebrew):**
   ```bash
   brew services start mongodb-community
   ```
   
   **Linux:**
   ```bash
   sudo systemctl start mongod
   ```

6. **Run the Flask Application**
   
   **Option A: Use diagnostic script (Recommended)**
   ```bash
   python run.py
   ```
   This will check all prerequisites and show helpful error messages.
   
   **Option B: Run directly**
   ```bash
   python app.py
   ```

7. **Open Browser**
   - Go to: `http://localhost:5000`

8. **Register Your First Account**
   - Click "Register" tab
   - Fill in your details
   - Select **Teacher** role
   - Click "Register"

---

## ✅ Verification Checklist

After starting, you should see:
- ✅ Login page loads at `http://localhost:5000`
- ✅ Can switch between Login/Register tabs
- ✅ Can register a new account
- ✅ After registration, redirected to dashboard
- ✅ No errors in terminal/console

---

## 🐛 Common Issues & Solutions

### Issue: "Port 5000 already in use"
**Solution:**
- Find and close the process using port 5000
- Or change port in `app.py` (line 402): `port=5001`

### Issue: "MongoDB connection failed"
**Solution (Local Setup):**
- Ensure MongoDB is running: `mongod` or check services
- Verify MongoDB is on port 27017

**Solution (Docker):**
- Check if MongoDB container is running: `docker ps`
- Restart: `docker-compose restart mongodb`

### Issue: "Module not found" errors
**Solution:**
- Make sure virtual environment is activated
- Reinstall: `pip install -r requirements.txt`

### Issue: Docker won't start
**Solution:**
- Ensure Docker Desktop is running
- Check: `docker --version`
- Try: `docker-compose down` then `docker-compose up --build`

---

## 📋 Next Steps After Setup

1. **Create a Teacher Account**
   - Register with Teacher role
   - This gives you full access

2. **Create Student Accounts**
   - Logout
   - Register with Student role
   - Or create multiple student accounts

3. **Start Using:**
   - **As Teacher:** Upload notes, create tests, post notices
   - **As Student:** View notes, take tests, see notices

---

## 🎯 Quick Test

After setup, try this:

1. Login as Teacher
2. Go to "Notes Management"
3. Upload a test note (any PDF/DOCX file)
4. Logout
5. Login as Student
6. Go to "Notes" section
7. You should see the uploaded note!

---

## 📞 Need Help?

- Check the full README.md for detailed documentation
- Review error messages in terminal
- Ensure all prerequisites are installed
- Verify ports 5000 and 27017 are available

---

**Happy Learning! 🎓**


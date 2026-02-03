# Classroom Management System

A full-stack web application for managing classroom activities, student records, course materials, and virtual learning sessions.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python Flask
- **Database**: MongoDB
- **Deployment**: Docker Compose

## Features

### Teacher Features
- Upload and manage course notes/resources
- View and edit student records
- Post announcements on notice board
- Create and manage Zoom class links
- Create multiple-choice tests with time windows
- View test results and submissions

### Student Features
- View and download course notes
- Access personal records (scores, attendance)
- View notices and announcements
- Access Zoom class links
- Take tests during active time windows

## Prerequisites

Before running the application, ensure you have:

1. **Python 3.11+** installed
2. **MongoDB** installed and running (or use Docker)
3. **Docker and Docker Compose** (optional, for containerized deployment)

## Setup Instructions

### Option 1: Local Development (Without Docker)

#### Step 1: Install Python Dependencies

```bash
# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

#### Step 2: Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service, it should start automatically
# Or start it manually:
mongod
```

**macOS (using Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud):**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update the connection string in `app.py` (line 18)

#### Step 3: Run the Flask Application

```bash
python app.py
```

The application will start on `http://localhost:5000`

### Option 2: Docker Compose (Recommended)

#### Step 1: Build and Start Containers

```bash
# Build and start all services (Flask app + MongoDB)
docker-compose up --build
```

This will:
- Start MongoDB container on port 27017
- Start Flask application on port 5000
- Create necessary volumes for data persistence

#### Step 2: Access the Application

Open your browser and navigate to: `http://localhost:5000`

#### Step 3: Stop the Application

```bash
# Stop containers (press Ctrl+C or run):
docker-compose down

# To also remove volumes (clean slate):
docker-compose down -v
```

## First-Time Setup

### Create Your First Account

1. Navigate to `http://localhost:5000`
2. Click on the **Register** tab
3. Fill in the registration form:
   - Full Name
   - Email
   - Password
   - Role: Select **Teacher** or **Student**
4. Click **Register**

### Create a Teacher Account

For the best experience, create a teacher account first:
- Register with role: **Teacher**
- This allows you to:
  - Upload notes
  - Create tests
  - Post notices
  - Set Zoom links
  - Manage student records

### Create Student Accounts

- Register with role: **Student**
- Or have a teacher create student accounts through the system

## Usage Guide

### For Teachers

1. **Login** with your teacher credentials
2. **Upload Notes**:
   - Go to "Notes Management"
   - Fill in title, subject, description
   - Upload file (PDF, DOCX, PPT)
   - Click "Upload Note"

3. **Manage Student Records**:
   - Go to "Student Records"
   - Click "View/Edit Records" for any student
   - Update test scores, attendance, or notes
   - Click "Update Records"

4. **Post Notices**:
   - Go to "Notice Board"
   - Enter title and content
   - Click "Post Notice"

5. **Set Zoom Link**:
   - Go to "Zoom Class"
   - Enter Zoom meeting URL
   - Optionally add Meeting ID, Password, and Scheduled Time
   - Click "Set Zoom Link"

6. **Create Tests**:
   - Go to "Test Management"
   - Click "Add Question" to add multiple-choice questions
   - Set start and end times
   - Click "Create Test"
   - View results by clicking "View Results"

### For Students

1. **Login** with your student credentials
2. **View Notes**:
   - Go to "Notes" section
   - Click "Download" to download any note

3. **View Records**:
   - Go to "My Records"
   - View your test scores, attendance, and teacher notes

4. **View Notices**:
   - Go to "Notices" section
   - Read all posted announcements

5. **Join Zoom Class**:
   - Go to "Zoom Class" section
   - Click "Join Zoom Meeting" link

6. **Take Tests**:
   - Go to "Tests" section
   - Click "Take Test" for active tests
   - Answer all questions
   - Click "Submit Test"
   - View your score immediately

## Project Structure

```
classroom/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker image configuration
├── docker-compose.yml    # Docker Compose configuration
├── README.md             # This file
├── .gitignore           # Git ignore rules
├── templates/           # HTML templates
│   ├── login.html
│   ├── teacher_dashboard.html
│   └── student_dashboard.html
├── static/              # Static files
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── teacher.js
│       └── student.js
└── uploads/            # Uploaded files (created automatically)
```

## API Endpoints

### Authentication
- `GET /` - Redirects to login or dashboard
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `POST /register` - Register new user
- `GET /logout` - Logout user

### Teacher APIs
- `GET /api/teacher/students` - Get all students
- `GET /api/teacher/notes` - Get all notes
- `POST /api/teacher/notes` - Upload new note
- `DELETE /api/teacher/notes/<id>` - Delete note
- `GET /api/teacher/notices` - Get all notices
- `POST /api/teacher/notices` - Post new notice
- `GET /api/teacher/zoom-link` - Get current zoom link
- `POST /api/teacher/zoom-link` - Set zoom link
- `GET /api/teacher/tests` - Get all tests
- `POST /api/teacher/tests` - Create new test
- `GET /api/teacher/tests/<id>/results` - Get test results
- `GET /api/teacher/student-records/<id>` - Get student records
- `POST /api/teacher/student-records/<id>` - Update student records

### Student APIs
- `GET /api/student/notes` - Get all notes
- `GET /api/student/download/<filename>` - Download note file
- `GET /api/student/records` - Get own records
- `GET /api/student/notices` - Get all notices
- `GET /api/student/zoom-link` - Get zoom link
- `GET /api/student/tests` - Get active tests
- `POST /api/student/tests/<id>/submit` - Submit test

## Troubleshooting

### MongoDB Connection Issues

**Error: "pymongo.errors.ServerSelectionTimeoutError"**

- Ensure MongoDB is running: `mongod` or check service status
- For Docker: Check if MongoDB container is running: `docker ps`
- Verify connection string in `app.py`

### Port Already in Use

**Error: "Address already in use"**

- Change port in `app.py`: `app.run(debug=True, host='0.0.0.0', port=5001)`
- Or stop the process using port 5000

### File Upload Issues

- Ensure `uploads/` directory exists and has write permissions
- Check file size (max 16MB)
- Verify file types are allowed

### Docker Issues

- Ensure Docker Desktop is running
- Try rebuilding: `docker-compose up --build`
- Check logs: `docker-compose logs`

## Security Notes

⚠️ **Important for Production:**

1. Change `app.secret_key` in `app.py` to a secure random string
2. Use environment variables for sensitive data
3. Implement HTTPS
4. Add rate limiting
5. Sanitize file uploads
6. Use MongoDB authentication
7. Implement proper session management
8. Add CSRF protection

## Development

### Running in Development Mode

The Flask app runs in debug mode by default. For production:

```python
app.run(debug=False, host='0.0.0.0', port=5000)
```

### Database Management

Access MongoDB shell:
```bash
# Local MongoDB
mongosh

# Docker MongoDB
docker exec -it classroom_mongodb mongosh
```

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check:
- Flask documentation: https://flask.palletsprojects.com/
- MongoDB documentation: https://docs.mongodb.com/
- Docker documentation: https://docs.docker.com/

---

**Happy Teaching! 🎓**


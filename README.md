# Scholar Rank - Education Platform

A modern, premium Classroom Management System built with FastAPI, MongoDB, and Vanilla JS/CSS. This platform allows teachers to manage course materials, post notices, schedule Zoom classes, and create custom-graded tests. Students get a personalized dashboard featuring a "Teacher Directory" to filter content specifically by instructor.

## 🚀 Key Features

* **Modern Glassmorphism UI**: A beautiful, highly responsive frontend design with dynamic micro-animations.
* **Teacher Directory**: Students can browse and filter content exclusively by the teacher who uploaded it.
* **Dynamic Testing System**: Teachers can create multiple-choice tests, set custom marks per question, and students get instantly graded upon submission.
* **Secure JWT Authentication**: Robust, cookie-based JWT authentication ensuring secure sessions across the application.
* **Strict MongoDB Integration**: Fully relies on MongoDB for persistent, reliable data storage.

---

## 🛠️ Technology Stack

* **Backend**: FastAPI, Uvicorn, Python-Jose (JWT)
* **Database**: MongoDB (PyMongo)
* **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Custom Design System)
* **Security**: Passlib (Bcrypt hashing), HTTPOnly Cookies

---

## ⚙️ Getting Started

### Prerequisites
1. Python 3.8+
2. A running instance of **MongoDB** locally (defaulting to `mongodb://localhost:27017/`) or remotely.

### Installation

1. **Clone the repository and enter the directory**:
   ```bash
   cd classroom
   ```

2. **Create and activate a virtual environment** (Optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install fastapi uvicorn pymongo passlib[bcrypt] python-jose python-multipart
   ```

4. **Environment Variables**:
   By default, the application runs out-of-the-box for local testing. If you are deploying, set the following environment variables:
   * `MONGO_URI`: Your MongoDB connection string (default: `mongodb://localhost:27017/`)
   * `SECRET_KEY`: A strong, random string for JWT encoding.

### Running the Application

To start the server, simply run the provided startup script from the root directory:

```bash
python start.py
```

The application will start on **http://localhost:8000**.

---

## 🧪 Testing

You can test the application by navigating to `http://localhost:8000` and clicking **Sign Up** to create new accounts. 

Alternatively, if your database has the original mock data populated, you can try logging in with the old test accounts:
* **Teacher**: `teacher@scholarrank.com` / `teacher123`
* **Student**: `student@scholarrank.com` / `student123`

---

## 📂 Project Structure

```text
classroom/
├── backend/
│   ├── src/
│   │   ├── routers/          # API endpoints (auth, student, teacher)
│   │   ├── database.py       # MongoDB connection logic
│   │   ├── main.py           # FastAPI entry point & app mounting
│   │   ├── models.py         # Pydantic schemas for data validation
│   │   └── utils/            # JWT and hashing utilities
├── frontend/
│   ├── static/               # CSS, JS, Images (scholar-rank.css)
│   └── templates/            # HTML views (dashboards, landing page)
├── start.py                  # Single entry point script to run the server
└── README.md
```

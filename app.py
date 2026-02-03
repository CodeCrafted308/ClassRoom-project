from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os
import json

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
CORS(app)

# MongoDB connection - supports both local and Docker environments
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Test connection
    client.server_info()
    db = client['classroom_db']
    print("✓ MongoDB connected successfully")
except Exception as e:
    print(f"✗ MongoDB connection error: {e}")
    print("Please ensure MongoDB is running on mongodb://localhost:27017/")
    print("Or set MONGO_URI environment variable")
    raise

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Helper function to convert ObjectId to string
def json_serial(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

# Authentication Routes
@app.route('/')
def index():
    if 'user_id' in session:
        try:
            user = db.users.find_one({'_id': ObjectId(session['user_id'])})
            if user:
                if user['role'] == 'teacher':
                    return redirect(url_for('teacher_dashboard'))
                else:
                    return redirect(url_for('student_dashboard'))
        except Exception as e:
            # Invalid session, clear it
            session.clear()
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return jsonify({'success': False, 'message': 'Email and password required'}), 400
            
            user = db.users.find_one({'email': email})
            if user and check_password_hash(user['password'], password):
                session['user_id'] = str(user['_id'])
                session['role'] = user['role']
                return jsonify({'success': True, 'role': user['role']})
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
    
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role', 'student')
        
        if not email or not password or not name:
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        if db.users.find_one({'email': email}):
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        
        user = {
            'email': email,
            'password': generate_password_hash(password),
            'name': name,
            'role': role,
            'created_at': datetime.utcnow()
        }
        
        result = db.users.insert_one(user)
        session['user_id'] = str(result.inserted_id)
        session['role'] = role
        
        return jsonify({'success': True, 'role': role})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# Teacher Routes
@app.route('/teacher/dashboard')
def teacher_dashboard():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return redirect(url_for('login'))
    return render_template('teacher_dashboard.html')

@app.route('/api/teacher/students', methods=['GET'])
def get_students():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    students = list(db.users.find({'role': 'student'}, {'password': 0}))
    for student in students:
        student['_id'] = str(student['_id'])
        # Get student records
        records = db.student_records.find_one({'student_id': student['_id']})
        student['records'] = records if records else {}
    return jsonify(students)

@app.route('/api/teacher/notes', methods=['GET', 'POST'])
def manage_notes():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        title = request.form.get('title')
        description = request.form.get('description', '')
        subject = request.form.get('subject', 'General')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        note = {
            'title': title,
            'description': description,
            'subject': subject,
            'filename': filename,
            'filepath': filepath,
            'uploaded_by': session['user_id'],
            'uploaded_at': datetime.utcnow()
        }
        
        db.notes.insert_one(note)
        return jsonify({'success': True, 'message': 'Note uploaded successfully'})
    
    # GET request
    notes = list(db.notes.find().sort('uploaded_at', -1))
    for note in notes:
        note['_id'] = str(note['_id'])
        note['uploaded_at'] = note['uploaded_at'].isoformat()
    return jsonify(notes)

@app.route('/api/teacher/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    note = db.notes.find_one({'_id': ObjectId(note_id)})
    if note:
        # Delete file
        if os.path.exists(note['filepath']):
            os.remove(note['filepath'])
        db.notes.delete_one({'_id': ObjectId(note_id)})
        return jsonify({'success': True})
    return jsonify({'error': 'Note not found'}), 404

@app.route('/api/teacher/notices', methods=['GET', 'POST'])
def manage_notices():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        notice = {
            'title': data.get('title'),
            'content': data.get('content'),
            'posted_by': session['user_id'],
            'posted_at': datetime.utcnow()
        }
        db.notices.insert_one(notice)
        return jsonify({'success': True})
    
    notices = list(db.notices.find().sort('posted_at', -1).limit(10))
    for notice in notices:
        notice['_id'] = str(notice['_id'])
        notice['posted_at'] = notice['posted_at'].isoformat()
    return jsonify(notices)

@app.route('/api/teacher/zoom-link', methods=['GET', 'POST'])
def manage_zoom_link():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        zoom_link = {
            'url': data.get('url'),
            'meeting_id': data.get('meeting_id', ''),
            'password': data.get('password', ''),
            'scheduled_time': data.get('scheduled_time'),
            'created_by': session['user_id'],
            'created_at': datetime.utcnow()
        }
        # Update or insert zoom link
        db.zoom_links.delete_many({})  # Only one active link at a time
        db.zoom_links.insert_one(zoom_link)
        return jsonify({'success': True})
    
    zoom_link = db.zoom_links.find_one(sort=[('created_at', -1)])
    if zoom_link:
        zoom_link['_id'] = str(zoom_link['_id'])
        zoom_link['created_at'] = zoom_link['created_at'].isoformat()
    return jsonify(zoom_link if zoom_link else {})

@app.route('/api/teacher/tests', methods=['GET', 'POST'])
def manage_tests():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        test = {
            'title': data.get('title'),
            'description': data.get('description', ''),
            'questions': data.get('questions', []),
            'start_time': datetime.fromisoformat(data.get('start_time')),
            'end_time': datetime.fromisoformat(data.get('end_time')),
            'created_by': session['user_id'],
            'created_at': datetime.utcnow()
        }
        db.tests.insert_one(test)
        return jsonify({'success': True})
    
    tests = list(db.tests.find().sort('created_at', -1))
    for test in tests:
        test['_id'] = str(test['_id'])
        test['start_time'] = test['start_time'].isoformat()
        test['end_time'] = test['end_time'].isoformat()
        test['created_at'] = test['created_at'].isoformat()
    return jsonify(tests)

@app.route('/api/teacher/tests/<test_id>/results', methods=['GET'])
def get_test_results(test_id):
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    submissions = list(db.test_submissions.find({'test_id': test_id}))
    for submission in submissions:
        submission['_id'] = str(submission['_id'])
        submission['submitted_at'] = submission['submitted_at'].isoformat()
    return jsonify(submissions)

@app.route('/api/teacher/student-records/<student_id>', methods=['GET', 'POST'])
def manage_student_records(student_id):
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        record = {
            'student_id': student_id,
            'attendance': data.get('attendance', []),
            'test_scores': data.get('test_scores', []),
            'notes': data.get('notes', ''),
            'updated_by': session['user_id'],
            'updated_at': datetime.utcnow()
        }
        db.student_records.update_one(
            {'student_id': student_id},
            {'$set': record},
            upsert=True
        )
        return jsonify({'success': True})
    
    record = db.student_records.find_one({'student_id': student_id})
    if record:
        record['_id'] = str(record['_id'])
        record['updated_at'] = record['updated_at'].isoformat()
    return jsonify(record if record else {})

# Student Routes
@app.route('/student/dashboard')
def student_dashboard():
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
    return render_template('student_dashboard.html')

@app.route('/api/student/notes', methods=['GET'])
def get_notes():
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    notes = list(db.notes.find().sort('uploaded_at', -1))
    for note in notes:
        note['_id'] = str(note['_id'])
        note['uploaded_at'] = note['uploaded_at'].isoformat()
    return jsonify(notes)

@app.route('/api/student/download/<filename>')
def download_note(filename):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/student/records', methods=['GET'])
def get_student_records():
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    student_id = session['user_id']
    record = db.student_records.find_one({'student_id': student_id})
    if record:
        record['_id'] = str(record['_id'])
        record['updated_at'] = record['updated_at'].isoformat()
    return jsonify(record if record else {})

@app.route('/api/student/notices', methods=['GET'])
def get_notices():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    notices = list(db.notices.find().sort('posted_at', -1).limit(10))
    for notice in notices:
        notice['_id'] = str(notice['_id'])
        notice['posted_at'] = notice['posted_at'].isoformat()
    return jsonify(notices)

@app.route('/api/student/zoom-link', methods=['GET'])
def get_zoom_link():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    zoom_link = db.zoom_links.find_one(sort=[('created_at', -1)])
    if zoom_link:
        zoom_link['_id'] = str(zoom_link['_id'])
        zoom_link['created_at'] = zoom_link['created_at'].isoformat()
    return jsonify(zoom_link if zoom_link else {})

@app.route('/api/student/tests', methods=['GET'])
def get_active_tests():
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    now = datetime.utcnow()
    tests = list(db.tests.find({
        'start_time': {'$lte': now},
        'end_time': {'$gte': now}
    }).sort('created_at', -1))
    
    student_id = session['user_id']
    for test in tests:
        test['_id'] = str(test['_id'])
        test['start_time'] = test['start_time'].isoformat()
        test['end_time'] = test['end_time'].isoformat()
        # Check if already submitted
        submission = db.test_submissions.find_one({
            'test_id': str(test['_id']),
            'student_id': student_id
        })
        test['submitted'] = submission is not None
        if submission:
            test['score'] = submission.get('score', 0)
    
    return jsonify(tests)

@app.route('/api/student/tests/<test_id>/submit', methods=['POST'])
def submit_test(test_id):
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    test = db.tests.find_one({'_id': ObjectId(test_id)})
    if not test:
        return jsonify({'error': 'Test not found'}), 404
    
    now = datetime.utcnow()
    if now < test['start_time'] or now > test['end_time']:
        return jsonify({'error': 'Test is not active'}), 400
    
    data = request.get_json()
    answers = data.get('answers', {})
    
    # Calculate score
    score = 0
    total = len(test['questions'])
    for i, question in enumerate(test['questions']):
        if str(i) in answers and answers[str(i)] == question.get('correct_answer'):
            score += 1
    
    submission = {
        'test_id': test_id,
        'student_id': session['user_id'],
        'answers': answers,
        'score': score,
        'total': total,
        'submitted_at': datetime.utcnow()
    }
    
    db.test_submissions.insert_one(submission)
    return jsonify({'success': True, 'score': score, 'total': total})

if __name__ == '__main__':
    try:
        print("\n" + "="*50)
        print("Starting Classroom Management System...")
        print("="*50)
        print(f"MongoDB URI: {mongo_uri}")
        print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
        print("="*50)
        print("\n✓ Server starting on http://localhost:5000")
        print("✓ Press Ctrl+C to stop\n")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\n✗ Error starting server: {e}")
        raise



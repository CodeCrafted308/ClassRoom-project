from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from datetime import datetime, timedelta
from bson import ObjectId
import os
import pathlib
from backend.src.models import TestSubmission
from backend.src.database import get_db
from backend.src.auth import require_auth

router = APIRouter(prefix="/api/student", dependencies=[Depends(require_auth())])

current_dir = pathlib.Path(__file__).parent.parent.parent.parent
UPLOAD_FOLDER = str(current_dir / "uploads")

def convert_objectid(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: convert_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid(item) for item in obj]
    return obj

@router.get("/teachers")
async def get_student_teachers():
    """Returns a list of all teachers so students can select one."""
    teachers = list(get_db().users.find({'role': 'teacher'}, {'password': 0}))
    return convert_objectid(teachers)

@router.get("/notes")
async def get_student_notes(teacher: str = None):
    query = {}
    if teacher:
        query['uploaded_by'] = teacher
        
    notes = list(get_db().notes.find(query).sort('uploaded_at', -1))
    for note in notes:
        note['_id'] = str(note['_id'])
        note['uploaded_at'] = note['uploaded_at'].isoformat()
    return convert_objectid(notes)

@router.get("/download/{filename}")
async def download_note(filename: str):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")

@router.get("/records")
async def get_student_records(current_user: dict = Depends(require_auth())):
    student_id = current_user['user_id']
    record = get_db().student_records.find_one({'student_id': student_id})
    if record:
        record['_id'] = str(record['_id'])
        record['test_scores'] = record.get('test_scores', [])
        record['attendance'] = record.get('attendance', [])
        record['notes'] = record.get('notes', '')
        return convert_objectid(record)
    else:
        return {"test_scores": [], "attendance": [], "notes": "No records available"}

@router.get("/notices")
async def get_student_notices(teacher: str = None):
    query = {}
    if teacher:
        query['posted_by'] = teacher
        
    notices = list(get_db().notices.find(query).sort('posted_at', -1).limit(10))
    for notice in notices:
        notice['_id'] = str(notice['_id'])
        notice['posted_at'] = notice['posted_at'].isoformat()
    return convert_objectid(notices)

@router.get("/zoom-link")
async def get_student_zoom_link(teacher: str = None):
    query = {}
    if teacher:
        query['created_by'] = teacher
        
    zoom_link = get_db().zoom_links.find_one(query, sort=[('created_at', -1)])
    if zoom_link:
        zoom_link['_id'] = str(zoom_link['_id'])
        zoom_link['created_at'] = zoom_link['created_at'].isoformat()
    return convert_objectid(zoom_link) if zoom_link else {}

@router.get("/tests")
async def get_active_tests(teacher: str = None, current_user: dict = Depends(require_auth())):
    now = datetime.utcnow()
    query = {
        'start_time': {'$lte': now},
        'end_time': {'$gte': now}
    }
    if teacher:
        query['created_by'] = teacher
        
    tests = list(get_db().tests.find(query).sort('created_at', -1))
    student_id = current_user['user_id']
    
    for test in tests:
        test['_id'] = str(test['_id'])
        test['start_time'] = test['start_time'].isoformat()
        test['end_time'] = test['end_time'].isoformat()
        submission = get_db().test_submissions.find_one({
            'test_id': str(test['_id']),
            'student_id': student_id
        })
        test['submitted'] = submission is not None
        if submission:
            test['score'] = submission.get('score', 0)
            
    return convert_objectid(tests)

@router.post("/tests/{test_id}/submit")
async def submit_test(test_id: str, submission: TestSubmission, current_user: dict = Depends(require_auth())):
    db = get_db()
    test = db.tests.find_one({'_id': ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    now = datetime.utcnow()
    if now > test['end_time']:
        raise HTTPException(status_code=400, detail="Test has ended")
        
    student_id = current_user['user_id']
    existing = db.test_submissions.find_one({
        'test_id': test_id,
        'student_id': student_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted")
        
    # Calculate score
    score = 0
    total = 0
    for i, q in enumerate(test['questions']):
        q_marks = q.get('marks', 1)
        total += q_marks
        ans = submission.answers.get(str(i))
        if ans is not None and ans == q.get('correct_answer'):
            score += q_marks
            
    submission_data = {
        'test_id': test_id,
        'student_id': student_id,
        'answers': submission.answers,
        'score': score,
        'total': total,
        'submitted_at': now
    }
    
    db.test_submissions.insert_one(submission_data)
    
    # Also record in student records
    db.student_records.update_one(
        {'student_id': student_id},
        {'$push': {'test_scores': {'test_id': test_id, 'test_title': test['title'], 'score': score, 'total': total, 'date': now}}},
        upsert=True
    )
    
    return {"success": True, "score": score, "total": total}

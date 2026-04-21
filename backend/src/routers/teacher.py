from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from datetime import datetime
from bson import ObjectId
import os
import pathlib
from backend.src.models import Notice, ZoomLink, Test, StudentRecord
from backend.src.database import get_db
from backend.src.auth import require_role

router = APIRouter(prefix="/api/teacher", dependencies=[Depends(require_role("teacher"))])

current_dir = pathlib.Path(__file__).parent.parent.parent.parent
UPLOAD_FOLDER = str(current_dir / "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def convert_objectid(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: convert_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid(item) for item in obj]
    return obj

@router.get("/students")
async def get_students():
    db = get_db()
    students = list(db.users.find({'role': 'student'}, {'password': 0}))
    for student in students:
        student['_id'] = str(student['_id'])
        records = db.student_records.find_one({'student_id': student['_id']})
        student['records'] = records if records else {}
    return convert_objectid(students)

@router.post("/notes")
async def upload_note(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(""),
    subject: str = Form("General"),
    current_user: dict = Depends(require_role("teacher"))
):
    try:
        filename = file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        note = {
            'title': title,
            'description': description,
            'subject': subject,
            'filename': filename,
            'filepath': filepath,
            'uploaded_by': current_user['user_id'],
            'uploaded_at': datetime.utcnow()
        }
        
        get_db().notes.insert_one(note)
        return {"success": True, "message": "Note uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/notes")
async def get_notes(current_user: dict = Depends(require_role("teacher"))):
    notes = list(get_db().notes.find({'uploaded_by': current_user['user_id']}).sort('uploaded_at', -1))
    for note in notes:
        note['_id'] = str(note['_id'])
        note['uploaded_at'] = note['uploaded_at'].isoformat()
    return convert_objectid(notes)

@router.delete("/notes/{note_id}")
async def delete_note(note_id: str, current_user: dict = Depends(require_role("teacher"))):
    try:
        db = get_db()
        note = db.notes.find_one({'_id': ObjectId(note_id), 'uploaded_by': current_user['user_id']})
        if note:
            if os.path.exists(note['filepath']):
                os.remove(note['filepath'])
            db.notes.delete_one({'_id': ObjectId(note_id)})
            return {"success": True}
        raise HTTPException(status_code=404, detail="Note not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/notices")
async def create_notice(notice: Notice, current_user: dict = Depends(require_role("teacher"))):
    notice_data = {
        'title': notice.title,
        'content': notice.content,
        'posted_by': current_user['user_id'],
        'posted_at': datetime.utcnow()
    }
    get_db().notices.insert_one(notice_data)
    return {"success": True}

@router.get("/notices")
async def get_notices(current_user: dict = Depends(require_role("teacher"))):
    notices = list(get_db().notices.find({'posted_by': current_user['user_id']}).sort('posted_at', -1).limit(10))
    for notice in notices:
        notice['_id'] = str(notice['_id'])
        notice['posted_at'] = notice['posted_at'].isoformat()
    return convert_objectid(notices)

@router.post("/zoom-link")
async def create_zoom_link(zoom_data: ZoomLink, current_user: dict = Depends(require_role("teacher"))):
    zoom_link = {
        'url': zoom_data.url,
        'meeting_id': zoom_data.meeting_id,
        'password': zoom_data.password,
        'scheduled_time': zoom_data.scheduled_time,
        'created_by': current_user['user_id'],
        'created_at': datetime.utcnow()
    }
    db = get_db()
    db.zoom_links.delete_many({'created_by': current_user['user_id']})
    db.zoom_links.insert_one(zoom_link)
    return {"success": True}

@router.get("/zoom-link")
async def get_zoom_link(current_user: dict = Depends(require_role("teacher"))):
    zoom_link = get_db().zoom_links.find_one({'created_by': current_user['user_id']}, sort=[('created_at', -1)])
    if zoom_link:
        zoom_link['_id'] = str(zoom_link['_id'])
        zoom_link['created_at'] = zoom_link['created_at'].isoformat()
    return convert_objectid(zoom_link) if zoom_link else {}

@router.post("/tests")
async def create_test(test_data: Test, current_user: dict = Depends(require_role("teacher"))):
    try:
        test = {
            'title': test_data.title,
            'description': test_data.description,
            'questions': test_data.questions,
            'start_time': datetime.fromisoformat(test_data.start_time),
            'end_time': datetime.fromisoformat(test_data.end_time),
            'created_by': current_user['user_id'],
            'created_at': datetime.utcnow()
        }
        get_db().tests.insert_one(test)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/tests")
async def get_tests(current_user: dict = Depends(require_role("teacher"))):
    tests = list(get_db().tests.find({'created_by': current_user['user_id']}).sort('created_at', -1))
    for test in tests:
        test['_id'] = str(test['_id'])
        test['start_time'] = test['start_time'].isoformat()
        test['end_time'] = test['end_time'].isoformat()
        test['created_at'] = test['created_at'].isoformat()
    return convert_objectid(tests)

@router.get("/tests/{test_id}/results")
async def get_test_results(test_id: str, current_user: dict = Depends(require_role("teacher"))):
    submissions = list(get_db().test_submissions.find({'test_id': test_id}))
    for submission in submissions:
        submission['_id'] = str(submission['_id'])
        submission['submitted_at'] = submission['submitted_at'].isoformat()
    return convert_objectid(submissions)

@router.post("/student-records/{student_id}")
async def update_student_records(student_id: str, record: StudentRecord, current_user: dict = Depends(require_role("teacher"))):
    record_data = {
        'student_id': student_id,
        'attendance': record.attendance,
        'test_scores': record.test_scores,
        'notes': record.notes,
        'updated_by': current_user['user_id'],
        'updated_at': datetime.utcnow()
    }
    get_db().student_records.update_one(
        {'student_id': student_id},
        {'$set': record_data},
        upsert=True
    )
    return {"success": True}

@router.get("/student-records/{student_id}")
async def get_student_records(student_id: str, current_user: dict = Depends(require_role("teacher"))):
    record = get_db().student_records.find_one({'student_id': student_id})
    if record:
        record['_id'] = str(record['_id'])
        record['updated_at'] = record['updated_at'].isoformat()
    return convert_objectid(record) if record else {}

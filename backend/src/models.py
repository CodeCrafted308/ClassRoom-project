from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: str = "student"

class Notice(BaseModel):
    title: str
    content: str

class ZoomLink(BaseModel):
    url: str
    meeting_id: Optional[str] = ""
    password: Optional[str] = ""
    scheduled_time: Optional[str] = None

class Test(BaseModel):
    title: str
    description: Optional[str] = ""
    questions: List[Dict[str, Any]]
    start_time: str
    end_time: str

class StudentRecord(BaseModel):
    attendance: Optional[List[str]] = []
    test_scores: Optional[List[Dict[str, Any]]] = []
    notes: Optional[str] = ""

class TestSubmission(BaseModel):
    answers: Dict[str, Any]

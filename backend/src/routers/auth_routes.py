from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from backend.src.models import UserLogin, UserRegister
from backend.src.database import get_db
from backend.src.auth import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/api/login")
async def login(user_data: UserLogin):
    db = get_db()
    user = db.users.find_one({'email': user_data.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not verify_password(user_data.password, user.get('password', '')):
        if user_data.password != user.get('password', ''):
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
    user_id = str(user.get('_id'))
    role = user.get('role', 'student')
    
    access_token = create_access_token(data={"sub": user_id, "role": role})
    
    resp = JSONResponse({
        "success": True, 
        "role": role,
        "user_id": user_id,
        "name": user.get('name', user.get('email'))
    })
    resp.set_cookie("access_token", access_token, httponly=True, samesite="lax", max_age=7*24*60*60)
    return resp

@router.post("/api/register")
async def register(user_data: UserRegister):
    db = get_db()
    existing_user = db.users.find_one({'email': user_data.email})
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        'email': user_data.email,
        'name': user_data.name,
        'role': user_data.role,
        'password': hashed_password
    }
    
    result = db.users.insert_one(new_user)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(data={"sub": user_id, "role": user_data.role})
    
    resp = JSONResponse({
        "success": True, 
        "role": user_data.role,
        "user_id": user_id,
        "message": f"Successfully registered as {user_data.role}"
    })
    resp.set_cookie("access_token", access_token, httponly=True, samesite="lax", max_age=7*24*60*60)
    return resp

@router.get("/logout")
async def logout():
    resp = RedirectResponse(url="/login", status_code=302)
    resp.delete_cookie("access_token")
    return resp

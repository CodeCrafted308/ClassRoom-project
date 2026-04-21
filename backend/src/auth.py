import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Request, HTTPException
from fastapi.security import APIKeyCookie

SECRET_KEY = os.getenv("SECRET_KEY", "my_super_secret_key_for_development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = APIKeyCookie(name="access_token", auto_error=False)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            return None
        return {"user_id": user_id, "role": role}
    except JWTError:
        return None

def require_auth():
    def dependency(request: Request):
        user = get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user
    return dependency

def require_role(required_role: str):
    def dependency(request: Request):
        user = get_current_user(request)
        if not user or user.get('role') != required_role:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user
    return dependency

import os
import numpy as np
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, create_engine, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from PIL import Image
import tensorflow as tf
from datetime import datetime, timedelta
from uuid import uuid4
from typing import List
from fastapi.staticfiles import StaticFiles

app = FastAPI()


# OAuth2 must be defined early
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

CHANNELS = 3
IMAGE_SIZE = 256
MODEL = tf.keras.models.load_model("model.h5", compile=False)
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Database setup
DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT config
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3000

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    records = relationship("PotatoRecord", back_populates="user")

class PotatoRecord(Base):
    __tablename__ = "patient_records"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    result = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="records")

Base.metadata.create_all(bind=engine)

# Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    username: str
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class AnalysisOut(BaseModel):
    filename: str
    result: str
    timestamp: datetime  # Accepts datetime object

    class Config:
        orm_mode = True

# Utility functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    image = np.expand_dims(image, 0)
    # image = tf.image.resize_with_crop_or_pad(image,IMAGE_SIZE,IMAGE_SIZE)
    # image = tf.reshape(image, (-1,IMAGE_SIZE, IMAGE_SIZE, CHANNELS))
    return image

def save_uploaded_file(contents: bytes, filename: str) -> str:
    # Add default extension if missing
    if not os.path.splitext(filename)[1].lower() in [".jpeg", ".jpg", ".png"]:
        filename += ".jpeg"

    sanitized_filename = filename.encode("utf-8", "ignore").decode("utf-8")
    file_path = os.path.join(UPLOAD_DIR, sanitized_filename)

    image = Image.open(BytesIO(contents))
    image.save(file_path)

    return sanitized_filename


# Routes
@app.get("/ping")
async def ping():
    return "Hello, I am alive"

@app.post("/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(lambda: next(get_db())), token: str = Depends(oauth2_scheme)):
    # Authenticate user
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

    user = get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    contents = await file.read()
    image = read_file_as_image(contents)
    predictions = MODEL.predict(image)
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]


    # Save the file and get the sanitized filename
    file_id = str(uuid4())
    sanitized_filename = save_uploaded_file(contents, file_id)

    # Store in DB
    record = PotatoRecord(filename=sanitized_filename, result=predicted_class, uploaded_by=user.id, timestamp=datetime.utcnow())
    db.add(record)
    db.commit()

    return {'class': predicted_class}

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse(username=new_user.username, email=new_user.email)

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    user = get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return UserResponse(username=user.username, email=user.email)

@app.get("/history", response_model=List[AnalysisOut])
async def get_history(token: str = Depends(oauth2_scheme), db: Session = Depends(lambda: next(get_db()))):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

    user = get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    record = db.query(PotatoRecord).filter(PotatoRecord.uploaded_by == user.id).order_by(PotatoRecord.timestamp.desc()).all()
    

    return record
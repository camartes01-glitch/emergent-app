
from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, File, UploadFile
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import bcrypt
import databases
import sqlalchemy
import boto3
from botocore.exceptions import NoCredentialsError

# ========================
# Environment and Configuration
# ========================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database Configuration
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost/db")
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")

s3_client = None
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and S3_BUCKET_NAME:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

# ========================
# Logging
# ========================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========================
# SQLAlchemy Table Definitions
# ========================

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("full_name", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("phone", sqlalchemy.String, unique=True, nullable=False),
    sqlalchemy.Column("email", sqlalchemy.String, unique=True, nullable=False),
    sqlalchemy.Column("password", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("reference_id", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("profile_completed", sqlalchemy.Boolean, default=False),
    sqlalchemy.Column("user_type", sqlalchemy.JSON, default=[]),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
    sqlalchemy.Column("token", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("profile_picture_url", sqlalchemy.String, nullable=True), # New field for profile picture
)

otps = sqlalchemy.Table(
    "otps",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("identifier", sqlalchemy.String, index=True),
    sqlalchemy.Column("otp", sqlalchemy.String),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
)

# ... (other table definitions remain the same)
profiles = sqlalchemy.Table(
    "profiles",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("user_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id"), nullable=False),
    sqlalchemy.Column("profile_type", sqlalchemy.JSON, default=[]),
    sqlalchemy.Column("freelancer_services", sqlalchemy.JSON, default=[]),
    sqlalchemy.Column("business_services", sqlalchemy.JSON, default=[]),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
)

service_profiles = sqlalchemy.Table(
    "service_profiles",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("user_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id"), nullable=False),
    sqlalchemy.Column("service_type", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("data", sqlalchemy.JSON), # To store the flexible data
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
)


# ========================
# Pydantic Models
# ========================

# ... (Pydantic models remain the same)
class UserBase(BaseModel):
    fullName: str
    phone: str
    email: EmailStr

class SignupRequest(BaseModel):
    fullName: str
    phone: str
    email: EmailStr
    password: str
    confirmPassword: str
    referenceId: Optional[str] = None
    otp: str

class LoginRequest(BaseModel):
    identifier: str
    password: Optional[str] = None
    otp: Optional[str] = None
    type: str

class InitialProfileRequest(BaseModel):
    userId: str
    profileType: List[str]
    freelancerServices: Optional[List[str]] = []
    businessServices: Optional[List[str]] = []

# ========================
# Helper Functions
# ========================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_otp() -> str:
    return "123456"  # Fixed OTP for testing

def generate_token() -> str:
    return str(uuid.uuid4())

def upload_file_to_s3(file: UploadFile, user_id: str) -> Optional[str]:
    if not s3_client:
        logger.error("S3 client is not initialized. Check AWS credentials and bucket name.")
        return None
    try:
        file_extension = Path(file.filename).suffix
        s3_filename = f"users/{user_id}/profile-pictures/{uuid.uuid4()}{file_extension}"

        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET_NAME,
            s3_filename,
            ExtraArgs={'ContentType': file.content_type, 'ACL': 'public-read'}
        )
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_filename}"
        return s3_url
    except NoCredentialsError:
        logger.error("AWS credentials not available.")
        return None
    except Exception as e:
        logger.error(f"Error uploading to S3: {e}")
        return None

# ========================
# FastAPI App and Router
# ========================

app = FastAPI(title="CAMARTES API")
api_router = APIRouter(prefix="/api")

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# ========================
# Auth Routes (Unchanged)
# ========================
# ... (existing auth routes)

# ========================
# File Upload Route
# ========================

@api_router.post("/files/upload-profile-picture")
async def upload_profile_picture(user_id: str, file: UploadFile = File(...)):
    user_query = users.select().where(users.c.id == user_id)
    user = await database.fetch_one(user_query)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    file_url = upload_file_to_s3(file, user_id)

    if not file_url:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not upload file.")

    # Update the user's profile_picture_url
    update_query = users.update().where(users.c.id == user_id).values(profile_picture_url=file_url)
    await database.execute(update_query)

    return {"message": "Profile picture uploaded successfully", "profile_picture_url": file_url}

# ========================
# Profile Routes (Unchanged)
# ========================
# ... (existing profile routes)

# ========================
# Generic Test Routes (Unchanged)
# ========================
# ... (existing test routes)

# ========================
# Final Setup
# ========================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be more specific in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

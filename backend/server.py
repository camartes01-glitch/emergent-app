from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime
import random
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========================
# Models
# ========================

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fullName: str
    phone: str
    email: EmailStr
    password: str
    referenceId: Optional[str] = None
    profileCompleted: bool = False
    userType: Optional[List[str]] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    token: Optional[str] = None

class SignupRequest(BaseModel):
    fullName: str
    phone: str
    email: EmailStr
    password: str
    confirmPassword: str
    referenceId: Optional[str] = None
    otp: str

class LoginRequest(BaseModel):
    identifier: str  # email or phone
    password: Optional[str] = None
    otp: Optional[str] = None
    type: str  # 'email' or 'phone'

class SendOtpRequest(BaseModel):
    identifier: str
    type: str  # 'email' or 'phone'

class SendSignupOtpRequest(BaseModel):
    email: EmailStr
    phone: str

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

# ========================
# Auth Routes
# ========================

@api_router.post("/auth/send-signup-otp")
async def send_signup_otp(request: SendSignupOtpRequest):
    # Check if user already exists
    existing_user = await db.users.find_one({
        "$or": [{"email": request.email}, {"phone": request.phone}]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
        )
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP in database (expires in 10 minutes)
    await db.otps.update_one(
        {"identifier": request.email},
        {"$set": {
            "otp": otp,
            "phone": request.phone,
            "createdAt": datetime.utcnow()
        }},
        upsert=True
    )
    
    # In production, send OTP via email/SMS
    logger.info(f"OTP for {request.email}: {otp}")
    
    return {"message": "OTP sent successfully", "otp": otp}  # Remove otp in production

@api_router.post("/auth/signup")
async def signup(request: SignupRequest):
    # Verify OTP
    otp_record = await db.otps.find_one({"identifier": request.email})
    
    if not otp_record or otp_record["otp"] != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Check if passwords match
    if request.password != request.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Hash password
    hashed_password = hash_password(request.password)
    
    # Create user
    user = User(
        fullName=request.fullName,
        phone=request.phone,
        email=request.email,
        password=hashed_password,
        referenceId=request.referenceId
    )
    
    await db.users.insert_one(user.dict())
    
    # Delete OTP
    await db.otps.delete_one({"identifier": request.email})
    
    return {"message": "User created successfully"}

@api_router.post("/auth/send-otp")
async def send_login_otp(request: SendOtpRequest):
    # Find user
    query = {"email": request.identifier} if request.type == "email" else {"phone": request.identifier}
    user = await db.users.find_one(query)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP
    await db.otps.update_one(
        {"identifier": request.identifier},
        {"$set": {
            "otp": otp,
            "createdAt": datetime.utcnow()
        }},
        upsert=True
    )
    
    logger.info(f"OTP for {request.identifier}: {otp}")
    
    return {"message": "OTP sent successfully", "otp": otp}  # Remove otp in production

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    # Find user
    query = {"email": request.identifier} if request.type == "email" else {"phone": request.identifier}
    user = await db.users.find_one(query)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify credentials
    if request.password:
        if not verify_password(request.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
    elif request.otp:
        otp_record = await db.otps.find_one({"identifier": request.identifier})
        if not otp_record or otp_record["otp"] != request.otp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP"
            )
        await db.otps.delete_one({"identifier": request.identifier})
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password or OTP required"
        )
    
    # Generate token
    token = generate_token()
    
    # Update user with token
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"token": token}}
    )
    
    # Return user data
    user_data = {
        "id": user["id"],
        "fullName": user["fullName"],
        "email": user["email"],
        "phone": user["phone"],
        "profileCompleted": user.get("profileCompleted", False),
        "userType": user.get("userType", []),
        "token": token
    }
    
    return {"user": user_data, "message": "Login successful"}

# ========================
# Profile Routes
# ========================

@api_router.post("/profile/initial-selection")
async def save_initial_profile(request: InitialProfileRequest):
    # Update user profile
    await db.users.update_one(
        {"id": request.userId},
        {"$set": {
            "userType": request.profileType
        }}
    )
    
    # Create profile document
    profile = {
        "userId": request.userId,
        "profileType": request.profileType,
        "freelancerServices": request.freelancerServices,
        "businessServices": request.businessServices,
        "createdAt": datetime.utcnow()
    }
    
    await db.profiles.insert_one(profile)
    
    return {"message": "Profile saved successfully"}

@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    profile = await db.profiles.find_one({"userId": user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    # Remove MongoDB ObjectId to make it JSON serializable
    if "_id" in profile:
        del profile["_id"]
    return profile

# ========================
# Test Routes
# ========================

@api_router.get("/")
async def root():
    return {"message": "CAMARTES Photography Ecosystem API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
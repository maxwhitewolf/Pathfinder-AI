from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class RecruiterCreate(BaseModel):
    email: EmailStr
    password: str
    company_name: str


class RecruiterResponse(BaseModel):
    id: int
    email: str
    company_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserProfileCreate(BaseModel):
    degree: Optional[str] = None
    cgpa_10th: Optional[float] = None
    cgpa_12th: Optional[float] = None
    cgpa_sem1: Optional[float] = None
    cgpa_sem2: Optional[float] = None
    cgpa_sem3: Optional[float] = None
    cgpa_sem4: Optional[float] = None
    cgpa_sem5: Optional[float] = None
    cgpa_sem6: Optional[float] = None
    cgpa_sem7: Optional[float] = None
    cgpa_sem8: Optional[float] = None
    skills: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    achievements: Optional[List[str]] = []
    career_interests: Optional[List[str]] = []


class UserProfileUpdate(BaseModel):
    degree: Optional[str] = None
    cgpa_10th: Optional[float] = None
    cgpa_12th: Optional[float] = None
    cgpa_sem1: Optional[float] = None
    cgpa_sem2: Optional[float] = None
    cgpa_sem3: Optional[float] = None
    cgpa_sem4: Optional[float] = None
    cgpa_sem5: Optional[float] = None
    cgpa_sem6: Optional[float] = None
    cgpa_sem7: Optional[float] = None
    cgpa_sem8: Optional[float] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    achievements: Optional[List[str]] = None
    career_interests: Optional[List[str]] = None


class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    degree: Optional[str]
    cgpa_10th: Optional[float]
    cgpa_12th: Optional[float]
    skills: Optional[List[str]]
    certifications: Optional[List[str]]
    achievements: Optional[List[str]]
    career_interests: Optional[List[str]]
    resume_path: Optional[str]
    extracted_skills: Optional[List[str]]
    
    class Config:
        from_attributes = True


class JobCreate(BaseModel):
    title: str
    description: str
    skills_required: List[str]
    location: Optional[str] = None
    salary: Optional[str] = None
    industry: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skills_required: Optional[List[str]] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None


class JobResponse(BaseModel):
    id: int
    recruiter_id: int
    title: str
    description: str
    skills_required: List[str]
    location: Optional[str]
    salary: Optional[str]
    industry: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class CareerPredictionRequest(BaseModel):
    cgpa_10th: float
    cgpa_12th: float
    cgpa_avg: float
    skills: List[str]


class RoadmapRequest(BaseModel):
    target_career: str
    missing_skills: Optional[List[str]] = []
    experience_level: Optional[str] = "beginner"
    time_commitment: Optional[str] = "part-time"


class ChatRequest(BaseModel):
    message: str


class FeedbackRequest(BaseModel):
    roadmap_variant: int
    rating: int
    user_context: dict
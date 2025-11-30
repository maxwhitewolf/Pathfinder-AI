from sqlalchemy import Column, Integer, String, Float, JSON, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    roadmaps = relationship("Roadmap", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    degree = Column(String)
    cgpa_10th = Column(Float)
    cgpa_12th = Column(Float)
    cgpa_sem1 = Column(Float)
    cgpa_sem2 = Column(Float)
    cgpa_sem3 = Column(Float)
    cgpa_sem4 = Column(Float)
    cgpa_sem5 = Column(Float)
    cgpa_sem6 = Column(Float)
    cgpa_sem7 = Column(Float)
    cgpa_sem8 = Column(Float)
    skills = Column(JSON)
    certifications = Column(JSON)
    achievements = Column(JSON)
    career_interests = Column(JSON)
    resume_path = Column(String)
    extracted_skills = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")


class Recruiter(Base):
    __tablename__ = "recruiters"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    company_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    jobs = relationship("Job", back_populates="recruiter")


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"))
    title = Column(String)
    description = Column(Text)
    skills_required = Column(JSON)
    location = Column(String)
    salary = Column(String)
    industry = Column(String)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    recruiter = relationship("Recruiter", back_populates="jobs")


class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    target_career = Column(String)
    roadmap_data = Column(JSON)
    selected_variant = Column(Integer)
    feedback_rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="roadmaps")
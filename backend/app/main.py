from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from app import models, schemas, auth, database, ml_service, gemini_service
from app.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PathFinder AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/register-user", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_password = auth.get_password_hash(user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/register-recruiter", response_model=schemas.RecruiterResponse)
def register_recruiter(recruiter: schemas.RecruiterCreate, db: Session = Depends(get_db)):
    db_recruiter = db.query(models.Recruiter).filter(models.Recruiter.email == recruiter.email).first()
    if db_recruiter:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_password = auth.get_password_hash(recruiter.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    db_recruiter = models.Recruiter(
        email=recruiter.email,
        hashed_password=hashed_password,
        company_name=recruiter.company_name
    )
    db.add(db_recruiter)
    db.commit()
    db.refresh(db_recruiter)
    return db_recruiter


@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if user and auth.verify_password(form_data.password, user.hashed_password):
        access_token = auth.create_access_token(data={"sub": user.email, "type": "user"})
        return {"access_token": access_token, "token_type": "bearer", "user_type": "user", "user_id": user.id}
    
    recruiter = db.query(models.Recruiter).filter(models.Recruiter.email == form_data.username).first()
    if recruiter and auth.verify_password(form_data.password, recruiter.hashed_password):
        access_token = auth.create_access_token(data={"sub": recruiter.email, "type": "recruiter"})
        return {"access_token": access_token, "token_type": "bearer", "user_type": "recruiter", "recruiter_id": recruiter.id}
    
    raise HTTPException(status_code=401, detail="Incorrect email or password")


@app.get("/api/user/profile", response_model=schemas.UserProfileResponse)
def get_user_profile(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@app.post("/api/user/profile", response_model=schemas.UserProfileResponse)
def create_user_profile(profile: schemas.UserProfileCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")
    
    db_profile = models.UserProfile(user_id=current_user.id, **profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


@app.put("/api/user/profile", response_model=schemas.UserProfileResponse)
def update_user_profile(profile: schemas.UserProfileUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile.dict(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile


@app.post("/api/user/upload-resume")
async def upload_resume(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOC files allowed")
    
    file_path = f"uploads/{current_user.id}_{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    resume_text = gemini_service.extract_text_from_file(file_path)
    
    if not resume_text or len(resume_text.strip()) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Could not extract text from resume. Please ensure the file is a valid PDF or DOC file."
        )
    
    skills_data = gemini_service.extract_skills(resume_text)
    
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if profile:
        profile.resume_path = file_path
        # Combine technical and soft skills, filter out any error messages
        all_skills = []
        if skills_data.get('technical_skills'):
            all_skills.extend(skills_data['technical_skills'])
        if skills_data.get('soft_skills'):
            all_skills.extend(skills_data['soft_skills'])
        profile.extracted_skills = all_skills
        db.commit()
    
    # Return response with error info if present
    response = {
        "message": "Resume Uploaded Successfully",
        "extracted_skills": {
            "technical_skills": skills_data.get('technical_skills', []),
            "soft_skills": skills_data.get('soft_skills', [])
        }
    }
    
    # Include error message if skill extraction failed
    if skills_data.get('error'):
        response["extraction_error"] = skills_data['error']
        response["message"] = "Resume uploaded, but skill extraction had issues"
    
    return response


@app.post("/api/recruiter/jobs", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    db_job = models.Job(recruiter_id=current_recruiter.id, **job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


@app.get("/api/recruiter/jobs", response_model=List[schemas.JobResponse])
def get_recruiter_jobs(current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == current_recruiter.id).all()
    return jobs


@app.put("/api/recruiter/jobs/{job_id}", response_model=schemas.JobResponse)
def update_job(job_id: int, job: schemas.JobUpdate, current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == current_recruiter.id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for key, value in job.dict(exclude_unset=True).items():
        setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job


@app.delete("/api/recruiter/jobs/{job_id}")
def close_job(job_id: int, current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == current_recruiter.id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.status = "closed"
    db.commit()
    return {"message": "Job closed successfully"}


@app.get("/api/jobs", response_model=List[schemas.JobResponse])
def get_all_jobs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    jobs = db.query(models.Job).filter(models.Job.status == "open").offset(skip).limit(limit).all()
    return jobs


@app.post("/api/ai/recommend-careers")
def recommend_careers(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    all_skills = (profile.skills or []) + (profile.extracted_skills or [])
    
    if not all_skills:
        raise HTTPException(status_code=400, detail="No skills found in profile. Please add skills or upload a resume first.")
    
    recommendations = ml_service.recommend_careers_knn(all_skills)
    
    if not recommendations:
        raise HTTPException(status_code=503, detail="Career recommendation service is unavailable. ML models may not be loaded properly.")
    
    return {"careers": recommendations}


@app.post("/api/ai/match-jobs")
def match_jobs(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile or not profile.resume_path:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload a resume first.")
    
    resume_text = gemini_service.extract_text_from_file(profile.resume_path)
    if not resume_text or len(resume_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract text from resume. Please ensure the file is valid.")
    
    combined_text = f"Degree: {profile.degree} CGPA: {profile.cgpa_10th}, {profile.cgpa_12th} Skills: {', '.join(profile.skills or [])} Resume: {resume_text}"
    
    matched_jobs = ml_service.match_jobs_doc2vec(combined_text)
    
    if not matched_jobs:
        raise HTTPException(status_code=503, detail="Job matching service is unavailable. ML models may not be loaded properly.")
    
    return {"jobs": matched_jobs}


@app.post("/api/ai/generate-roadmap")
def generate_roadmap(request: schemas.RoadmapRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    user_profile = {
        'target_career': request.target_career,
        'current_skills': (profile.skills or []) + (profile.extracted_skills or []),
        'missing_skills': request.missing_skills or [],
        'experience_level': request.experience_level or 'beginner',
        'time_commitment': request.time_commitment or 'part-time'
    }
    
    roadmap_result = gemini_service.generate_roadmaps(user_profile)
    
    # Check for errors
    if roadmap_result.get("error"):
        raise HTTPException(status_code=503, detail=roadmap_result["error"])
    
    roadmaps = roadmap_result.get("roadmaps", [])
    if not roadmaps:
        raise HTTPException(status_code=503, detail="Failed to generate roadmaps. Please try again later.")
    
    selected_roadmap = ml_service.select_best_roadmap(roadmaps, user_profile)
    
    if selected_roadmap:
        db_roadmap = models.Roadmap(
            user_id=current_user.id,
            target_career=request.target_career,
            roadmap_data=selected_roadmap,
            selected_variant=selected_roadmap.get('roadmap_id', 1)
        )
        db.add(db_roadmap)
        db.commit()
    
    return {"selected_roadmap": selected_roadmap, "all_roadmaps": roadmaps}


@app.post("/api/ai/skill-gap-analysis")
def skill_gap_analysis(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    user_skills = (profile.skills or []) + (profile.extracted_skills or [])
    career_recommendations = ml_service.recommend_careers_knn(user_skills, top_k=1)
    required_skills = career_recommendations[0]['required_skills'] if career_recommendations else []
    
    gap_analysis = gemini_service.analyze_skill_gap(user_skills, required_skills)
    
    # Check for errors
    if gap_analysis.get("error"):
        raise HTTPException(status_code=503, detail=gap_analysis["error"])
    
    return gap_analysis


@app.post("/api/ai/strengths-weaknesses")
def strengths_weaknesses(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    analysis = gemini_service.analyze_strengths_weaknesses(profile.__dict__)
    
    # Check for errors
    if analysis.get("error"):
        raise HTTPException(status_code=503, detail=analysis["error"])
    
    return analysis


@app.post("/api/ai/chat")
def chat(request: schemas.ChatRequest, current_user: models.User = Depends(auth.get_current_user)):
    chat_result = gemini_service.chat_with_context(request.message, {"name": current_user.full_name})
    
    # Check for errors
    if chat_result.get("error"):
        raise HTTPException(status_code=503, detail=chat_result["error"])
    
    return {"response": chat_result.get("response", "")}


@app.get("/")
def root():
    return {"message": "PathFinder AI API", "status": "running"}


if __name__ == "__main__":
    uvicorn.run("main:app", port=8001, reload=True)
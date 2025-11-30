"""
Job-Specific Roadmap Generation Service
Generates RL-aware learning roadmaps for specific job + user combinations
"""
import json
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Get API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAVrvI4aKG74YTgQwmWMfQDH0MoNUP5x7s")

# Initialize Gemini client (reusing same pattern as gemini_service)
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        client = genai.GenerativeModel("gemini-2.5-flash")
        print("Job Roadmap Service: Gemini API initialized successfully")
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini API in job_roadmap_service: {e}")
        client = None
else:
    client = None
MODEL = "gemini-2.5-flash"


def generate_job_roadmap(job: dict, user_profile: dict):
    """
    Generate an RL-ready roadmap for a specific job and user.
    
    Args:
        job: dict with fields like:
            {
                "id": "...",
                "job_title": "...",
                "company_name": "...",
                "jd_text": "...",
                "location_city": "...",
                "location_country": "...",
                "work_type": "onsite/remote/hybrid",
                "job_type": "full_time/part_time/internship/contract/freelance",
                "experience_level": "fresher/junior/mid/senior/lead",
                "min_experience_years": 0,
                "max_experience_years": 2,
                "skills_required": ["React", "Node.js", "AWS"],
                "nice_to_have_skills": ["LLMs", "LangChain"],
                "industry": "Software",
                ...
            }
        user_profile: dict with fields like:
            {
                "name": "User Name",
                "degree": "B.Tech CSE",
                "cgpa_10th": "9.4",
                "cgpa_12th": "9.1",
                "experience_years": 0,
                "current_role": "Student",
                "technical_skills": ["Python", "HTML", "CSS", "Basic React"],
                "soft_skills": ["Communication", "Problem Solving"],
                "certifications": ["Python Basics"],
                "achievements": ["Hackathon participation"],
                "target_career": "AI-Integrated Full Stack Engineer"
            }
    
    Returns:
        {
            "roadmap": { ... full JSON roadmap ... },
            "error": None or "error message"
        }
    """
    if not client:
        return {"roadmap": None, "error": "Gemini API not configured. Please set GEMINI_API_KEY."}
    
    target_career = user_profile.get("target_career") or job.get("job_title") or "AI-Integrated Full Stack Engineer"
    job_title = job.get("job_title", "")
    company_name = job.get("company_name", "")
    jd_text = job.get("jd_text", "")
    skills_required = job.get("skills_required", []) or []
    nice_to_have_skills = job.get("nice_to_have_skills", []) or []
    
    user_tech_skills = user_profile.get("technical_skills", []) or []
    user_soft_skills = user_profile.get("soft_skills", []) or []
    user_certs = user_profile.get("certifications", []) or []
    user_achievements = user_profile.get("achievements", []) or []
    user_experience_years = user_profile.get("experience_years", 0)
    user_degree = user_profile.get("degree", "N/A")
    
    # Build the prompt with job + user context
    prompt = f"""
You are an expert AI career coach. You design adaptive learning roadmaps for users to match specific job descriptions.

JOB DETAILS:

- Job Title: {job_title}
- Company: {company_name}
- Location: {job.get("location_city", "")}, {job.get("location_country", "")}
- Work Type: {job.get("work_type", "")}
- Job Type: {job.get("job_type", "")}
- Experience Level: {job.get("experience_level", "")}
- Min Experience (years): {job.get("min_experience_years", "")}
- Max Experience (years): {job.get("max_experience_years", "")}
- Industry: {job.get("industry", "")}

REQUIRED SKILLS (from job):
- Core required skills: {", ".join(skills_required) if skills_required else "Not explicitly listed"}
- Nice to have: {", ".join(nice_to_have_skills) if nice_to_have_skills else "None"}

JOB DESCRIPTION:
{jd_text[:4000]}

USER PROFILE:

- Name: {user_profile.get("name", "Student")}
- Degree: {user_degree}
- Experience (years): {user_experience_years}
- Technical skills: {", ".join(user_tech_skills) if user_tech_skills else "None"}
- Soft skills: {", ".join(user_soft_skills) if user_soft_skills else "None"}
- Certifications: {", ".join(user_certs) if user_certs else "None"}
- Achievements: {", ".join(user_achievements) if user_achievements else "None"}

Your task:

1) Understand what this job really expects (stack + responsibilities).
2) Compare job requirements with the user's current skills.
3) Produce a structured, RL-aware learning roadmap that will help this user reach this job.

You MUST return a SINGLE JSON object with this structure:

{{
  "role_summary": {{
    "title": "{target_career}",
    "what_you_do": [
      "... list key responsibilities extracted from JD ...",
      "...",
      "..."
    ],
    "required_stack": {{
      "frontend": ["JavaScript/TypeScript", "React", "Angular", "..."],
      "backend": ["Node.js", "Express", "Python", "Django", "Flask", "Java", "Spring Boot"],
      "ai_ml": ["TensorFlow", "PyTorch", "Hugging Face", "LangChain"],
      "cloud_devops": ["AWS", "Azure", "GCP", "Docker", "Kubernetes"],
      "data": ["SQL", "NoSQL"],
      "mlops": ["model serving", "monitoring", "CI/CD for models"],
      "nice_to_have": ["LLMs", "Generative AI", "Vector DBs", "Prompt Engineering"]
    }}
  }},
  "gap_analysis": {{
    "current_skills": {user_tech_skills},
    "transferable_skills": ["... infer from user's skills ..."],
    "missing_skills": [
      {{
        "skill": "...",
        "priority": "high/medium/low",
        "reason": "Why this is important for this job compared to user's current skills."
      }}
    ],
    "missing_certifications": [
      "... suggested certificates for this user based on job stack ..."
    ],
    "missing_experience": [
      "... practical experience the user lacks (e.g., production AI integration, microservices, cloud deployments) ..."
    ],
    "summary": "2-3 sentence summary of the gap between the user and this job."
  }},
  "roadmap": {{
    "phases": [
      {{
        "phase_id": 1,
        "phase_name": "Phase Name Based on Job Requirements",
        "goal": "Match specific JD requirement",
        "estimated_duration_weeks": 6,
        "tasks": [
          {{
            "task_id": "task_1",
            "title": "Task Title",
            "jd_alignment": [
              "Specific JD requirement this addresses",
              "Another JD requirement"
            ],
            "description": "Detailed description of what to learn",
            "status_options": ["start", "already_know", "need_easier", "skip", "finished"],
            "subtasks": [
              "Subtask 1",
              "Subtask 2",
              "Subtask 3"
            ],
            "recommended_courses": [
              "Course name or platform"
            ],
            "recommended_projects": [
              "Project idea"
            ],
            "skills_gained": [
              "Skill 1",
              "Skill 2"
            ]
          }}
        ]
      }}
    ]
  }}
}}

Important:
- Tailor the missing_skills list and phase emphasis based on THIS SPECIFIC USER vs THIS SPECIFIC JOB.
- Use the user's current skills to avoid repeating basics they already know.
- Create 4-6 phases that progressively build toward the job requirements.
- Each phase should have 2-4 tasks.
- Focus on skills actually mentioned in the job description.
- Return ONLY the JSON object above, no extra text.
"""

    try:
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.4)
        )
        
        if not response or not response.text:
            return {"roadmap": None, "error": "Empty response from AI while generating job roadmap."}
        
        response_text = response.text.strip()
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        
        roadmap = json.loads(response_text)
        return {"roadmap": roadmap, "error": None}
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error in generate_job_roadmap: {e}")
        print(f"Response text (truncated): {response_text[:400] if 'response_text' in locals() else 'N/A'}")
        return {"roadmap": None, "error": f"Failed to parse AI response: {str(e)}"}
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error in generate_job_roadmap: {error_msg}")
        
        if "API key" in error_msg or "PermissionDenied" in error_msg or "403" in error_msg:
            return {"roadmap": None, "error": "Gemini API key is invalid or expired. Please update the API key."}
        elif "404" in error_msg or "NotFound" in error_msg:
            return {"roadmap": None, "error": "Gemini model not found. Please check the model name."}
        else:
            return {"roadmap": None, "error": f"AI roadmap generation failed: {error_msg}"}


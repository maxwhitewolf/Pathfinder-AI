import joblib
import numpy as np
from gensim.models.doc2vec import Doc2Vec
from gensim.utils import simple_preprocess
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

# Load models
try:
    KNN_MODEL = joblib.load('ml_models/knn_career_model.pkl')
    MLB = joblib.load('ml_models/skills_mlb.pkl')
    CAREER_REF = joblib.load('ml_models/career_reference.pkl')
    DOC2VEC_MODEL = Doc2Vec.load('ml_models/doc2vec_job_model.model')
    JOB_VECTORS = joblib.load('ml_models/job_vectors.pkl')
    JOB_METADATA = joblib.load('ml_models/job_metadata.pkl')
    
    try:
        with open('ml_models/contextual_bandit.pkl', 'rb') as f:
            BANDIT_DATA = pickle.load(f)
    except:
        BANDIT_DATA = None
        
except Exception as e:
    print(f"Warning: Could not load ML models: {e}")
    KNN_MODEL = None
    DOC2VEC_MODEL = None
    BANDIT_DATA = None


def recommend_careers_knn(user_skills, top_k=5):
    """Recommend careers using KNN"""
    if not KNN_MODEL:
        return []
    
    try:
        user_skills_encoded = MLB.transform([user_skills])
        distances, indices = KNN_MODEL.kneighbors(
            user_skills_encoded, 
            n_neighbors=min(top_k, len(CAREER_REF))
        )
        
        recommendations = []
        for dist, idx in zip(distances[0], indices[0]):
            similarity = 1 - dist
            career = CAREER_REF.iloc[idx]['Career']
            career_skills = CAREER_REF.iloc[idx]['Skills']
            
            matching_skills = set(user_skills) & set(career_skills)
            missing_skills = set(career_skills) - set(user_skills)
            
            recommendations.append({
                'career': career,
                'similarity_score': round(similarity * 100, 2),
                'matching_skills': list(matching_skills),
                'missing_skills': list(missing_skills)[:5],
                'required_skills': career_skills
            })
        
        return recommendations
    except Exception as e:
        print(f"Error in KNN recommendation: {e}")
        return []


def match_jobs_doc2vec(resume_text, top_k=10):
    """Match jobs using Doc2Vec"""
    if not DOC2VEC_MODEL:
        return []
    
    try:
        resume_tokens = simple_preprocess(resume_text, deacc=True, min_len=2, max_len=15)
        resume_vector = DOC2VEC_MODEL.infer_vector(resume_tokens, epochs=20)
        resume_vector = resume_vector.reshape(1, -1)
        
        similarities = cosine_similarity(resume_vector, JOB_VECTORS)[0]
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            job = JOB_METADATA.iloc[idx]
            results.append({
                'job_id': int(job['ID_num']),
                'job_title': job['job_title'],
                'description': job['Short_description'],
                'skills_required': job['Skills_required'],
                'industry': job['Industry'],
                'pay_grade': job['Pay_grade'],
                'match_score': round(float(similarities[idx]) * 100, 2)
            })
        
        return results
    except Exception as e:
        print(f"Error in Doc2Vec matching: {e}")
        return []


def select_best_roadmap(roadmaps, user_profile):
    """Select best roadmap using Contextual Bandit"""
    if not roadmaps or len(roadmaps) == 0:
        return None
    
    if not BANDIT_DATA:
        # Default: return balanced path (variant 2)
        return roadmaps[1] if len(roadmaps) > 1 else roadmaps[0]
    
    try:
        # Simple selection based on experience level
        exp_level = user_profile.get('experience_level', 'beginner')
        
        if exp_level == 'beginner' and len(roadmaps) > 2:
            return roadmaps[2]  # Self-paced
        elif exp_level == 'advanced' and len(roadmaps) > 0:
            return roadmaps[0]  # Fast-track
        else:
            return roadmaps[1] if len(roadmaps) > 1 else roadmaps[0]  # Balanced
    except:
        return roadmaps[0]


def update_bandit_feedback(variant_id, rating, user_context):
    """Update bandit with user feedback"""
    # In production, this would update the bandit model
    # For now, we'll just log it
    print(f"Feedback received: Variant {variant_id}, Rating {rating}")
    pass
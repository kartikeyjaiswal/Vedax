from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

class RecommendRequest(BaseModel):
    user_id: str
    completed_task_ids: Optional[List[str]] = []
    points: Optional[int] = 0

# Predefined task pool for recommendations
TASK_POOL = [
    {"id": "t1", "title": "Plant a Sapling", "category": "Nature", "points": 100, "difficulty": "easy"},
    {"id": "t2", "title": "Zero Waste Day", "category": "Waste", "points": 150, "difficulty": "medium"},
    {"id": "t3", "title": "5-Minute Shower", "category": "Water", "points": 40, "difficulty": "easy"},
    {"id": "t4", "title": "Cycle to Work/College", "category": "Transport", "points": 80, "difficulty": "easy"},
    {"id": "t5", "title": "Solar Panel Visit", "category": "Energy", "points": 60, "difficulty": "easy"},
    {"id": "t6", "title": "Meatless Monday", "category": "Food", "points": 60, "difficulty": "easy"},
    {"id": "t7", "title": "Campus Clean Drive", "category": "Waste", "points": 200, "difficulty": "hard"},
    {"id": "t8", "title": "Energy Audit", "category": "Energy", "points": 120, "difficulty": "medium"},
    {"id": "t9", "title": "Rainwater Collection Setup", "category": "Water", "points": 170, "difficulty": "hard"},
    {"id": "t10", "title": "Compost Bin Setup", "category": "Waste", "points": 130, "difficulty": "medium"},
]

@router.post("/recommend-tasks")
async def recommend_tasks(req: RecommendRequest):
    """
    Simple collaborative filtering recommendation.
    Returns tasks the user hasn't completed, weighted by their level.
    """
    completed_set = set(req.completed_task_ids)
    available = [t for t in TASK_POOL if t["id"] not in completed_set]

    # Weight by user level (higher points = suggest harder tasks)
    if req.points < 200:
        preferred = [t for t in available if t["difficulty"] == "easy"]
    elif req.points < 1000:
        preferred = [t for t in available if t["difficulty"] in ["easy", "medium"]]
    else:
        preferred = available

    if not preferred:
        preferred = available

    # Return top 5 recommendations
    recommended = random.sample(preferred, min(5, len(preferred)))

    return {
        "recommendations": recommended,
        "user_level": "beginner" if req.points < 500 else "intermediate" if req.points < 2000 else "advanced",
        "total": len(recommended)
    }

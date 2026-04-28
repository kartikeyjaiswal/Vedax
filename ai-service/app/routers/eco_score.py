from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class EcoScoreRequest(BaseModel):
    points: Optional[int] = 0
    tasks_completed: Optional[int] = 0
    streak_days: Optional[int] = 0
    quizzes_completed: Optional[int] = 0

@router.post("/eco-score")
async def calculate_eco_score(req: EcoScoreRequest):
    """
    Calculate composite Eco Score and environmental impact metrics.
    """
    # Weighted scoring formula
    score = min(100, round(
        (req.points / 600) * 0.4 +
        (req.tasks_completed * 2) * 0.3 +
        (req.streak_days * 1.5) * 0.2 +
        (req.quizzes_completed * 1) * 0.1
    ))

    # Environmental impact calculations
    co2_saved_kg = round(req.points * 0.012, 2)
    trees_equivalent = req.tasks_completed // 5
    water_saved_liters = req.tasks_completed * 50
    plastic_reduced_kg = req.tasks_completed * 0.3
    energy_saved_kwh = req.points * 0.008

    # Badge eligibility
    badges = []
    if req.tasks_completed >= 10: badges.append("Eco Warrior")
    if req.streak_days >= 7: badges.append("Daily Streaker")
    if req.quizzes_completed >= 5: badges.append("Quiz Master")
    if co2_saved_kg >= 10: badges.append("Climate Champion")
    if trees_equivalent >= 1: badges.append("Tree Planter")

    return {
        "eco_score": score,
        "co2_saved_kg": co2_saved_kg,
        "trees_equivalent": trees_equivalent,
        "water_saved_liters": water_saved_liters,
        "plastic_reduced_kg": round(plastic_reduced_kg, 2),
        "energy_saved_kwh": round(energy_saved_kwh, 2),
        "earned_badges": badges,
        "impact_level": "High" if score >= 70 else "Medium" if score >= 40 else "Growing",
    }
